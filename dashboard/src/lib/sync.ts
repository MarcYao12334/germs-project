// Cross-device sync via WebSocket (primary) + BroadcastChannel (same-browser fallback)
// No localStorage polling — WebSocket is the source of truth for cross-device
import { io, Socket } from 'socket.io-client';

interface SyncEvent {
  type: string;
  payload: any;
  origin: 'dashboard' | 'citizen' | 'pro';
  ts: number;
}

type Handler = (payload: any) => void;
type ConnectionCallback = (connected: boolean) => void;

// Detect environment: if on Vercel (not localhost), use the Render URL
const isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
const WS_URL = import.meta.env.VITE_WS_URL || (isProduction ? 'https://germs-project.onrender.com' : 'http://localhost:3001');
const KEEPALIVE_INTERVAL = 4 * 60 * 1000; // 4 minutes

class GermsSyncChannel {
  private socket: Socket | null = null;
  private bc: BroadcastChannel | null = null;
  private listeners = new Map<string, Set<Handler>>();
  private connectionListeners = new Set<ConnectionCallback>();
  private myOrigin: 'dashboard' | 'citizen' | 'pro';
  private connected = false;
  private lastProcessedTs = 0;
  private pendingEvents: SyncEvent[] = []; // Events sent while disconnected
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null;
  private processedIds = new Set<string>(); // Dedup

  constructor(origin: 'dashboard' | 'citizen' | 'pro') {
    this.myOrigin = origin;
    this.lastProcessedTs = Date.now() - 600000; // Start 10 min ago to catch recent events

    // 1. WebSocket (cross-device — PRIMARY channel)
    try {
      this.socket = io(WS_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
        timeout: 30000,
      });

      this.socket.on('connect', () => {
        this.connected = true;
        console.log(`[Sync:${origin}] Connected to ${WS_URL}`);
        this.notifyConnection(true);

        // Request missed events since last known timestamp
        this.socket!.emit('sync-catchup', { lastTs: this.lastProcessedTs });

        // Flush pending events (sent while disconnected)
        if (this.pendingEvents.length > 0) {
          console.log(`[Sync:${origin}] Flushing ${this.pendingEvents.length} pending events`);
          for (const event of this.pendingEvents) {
            this.socket!.emit('sync-event', event);
          }
          this.pendingEvents = [];
        }
      });

      this.socket.on('disconnect', (reason) => {
        this.connected = false;
        console.log(`[Sync:${origin}] Disconnected: ${reason}`);
        this.notifyConnection(false);
      });

      this.socket.on('connect_error', (err) => {
        console.log(`[Sync:${origin}] Connection error: ${err.message}`);
        this.notifyConnection(false);
      });

      // Receive live events
      this.socket.on('sync-event', (event: SyncEvent) => {
        if (event.origin === this.myOrigin) return;
        this.dispatch(event);
      });

      // Receive catchup response (missed events)
      this.socket.on('sync-catchup-response', (data: { events: SyncEvent[] }) => {
        console.log(`[Sync:${origin}] Catchup: ${data.events.length} missed events`);
        for (const event of data.events) {
          if (event.origin === this.myOrigin) continue;
          this.dispatch(event);
        }
      });

      // Keep-alive acknowledgment
      this.socket.on('keep-alive-ack', () => {
        // Connection is alive
      });

    } catch (err) {
      console.log(`[Sync:${origin}] WebSocket init failed`);
    }

    // 2. BroadcastChannel (same-browser instant fallback)
    try {
      this.bc = new BroadcastChannel('germs-sync');
      this.bc.onmessage = (e) => {
        const event = e.data as SyncEvent;
        if (event.origin === this.myOrigin) return;
        this.dispatch(event);
      };
    } catch {}

    // 3. Keep-alive ping every 4 min
    this.keepAliveTimer = setInterval(() => {
      if (this.socket && this.connected) {
        this.socket.emit('keep-alive');
      }
      // Also ping the server HTTP endpoint to prevent sleep
      fetch(`${WS_URL}/ping`).catch(() => {});
    }, KEEPALIVE_INTERVAL);

    console.log(`[Sync:${origin}] Initialized — WS: ${WS_URL}`);
  }

  private dispatch(event: SyncEvent) {
    // Dedup by timestamp + type + origin
    const eventId = `${event.ts}-${event.type}-${event.origin}`;
    if (this.processedIds.has(eventId)) return;
    this.processedIds.add(eventId);
    // Keep dedup set small
    if (this.processedIds.size > 500) {
      const arr = Array.from(this.processedIds);
      this.processedIds = new Set(arr.slice(-250));
    }

    if (event.ts > this.lastProcessedTs) this.lastProcessedTs = event.ts;

    const handlers = this.listeners.get(event.type);
    if (handlers && handlers.size > 0) {
      console.log(`[Sync:${this.myOrigin}] ← ${event.type} from ${event.origin}`);
      handlers.forEach(h => h(event.payload));
    }
  }

  send(type: string, payload: any) {
    const event: SyncEvent = { type, payload, origin: this.myOrigin, ts: Date.now() };
    console.log(`[Sync:${this.myOrigin}] → ${type}`);

    // WebSocket (primary — cross-device)
    if (this.socket && this.connected) {
      this.socket.emit('sync-event', event);
    } else {
      // Store for later flush when reconnected
      this.pendingEvents.push(event);
      console.log(`[Sync:${this.myOrigin}] Queued (offline): ${type} (${this.pendingEvents.length} pending)`);
    }

    // BroadcastChannel (same-browser instant)
    try { this.bc?.postMessage(event); } catch {}
  }

  on(type: string, handler: Handler): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
    return () => { this.listeners.get(type)?.delete(handler); };
  }

  onConnection(callback: ConnectionCallback): () => void {
    this.connectionListeners.add(callback);
    // Immediately notify current state
    callback(this.connected);
    return () => { this.connectionListeners.delete(callback); };
  }

  private notifyConnection(connected: boolean) {
    this.connectionListeners.forEach(cb => cb(connected));
  }

  isConnected(): boolean {
    return this.connected;
  }

  destroy() {
    if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
    this.socket?.disconnect();
    this.bc?.close();
    this.listeners.clear();
    this.connectionListeners.clear();
  }
}

export function createSync(origin: 'dashboard' | 'citizen' | 'pro') {
  return new GermsSyncChannel(origin);
}
