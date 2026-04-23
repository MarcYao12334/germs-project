// GERMS Sync — Single shared instance with WebSocket + BroadcastChannel + localStorage fallback
import { io, Socket } from 'socket.io-client';

interface SyncEvent {
  type: string;
  payload: any;
  origin: 'dashboard' | 'citizen' | 'pro';
  ts: number;
}

type Handler = (payload: any) => void;
type ConnectionCallback = (connected: boolean) => void;

const isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
const WS_URL = import.meta.env.VITE_WS_URL || (isProduction ? 'https://germs-project.onrender.com' : 'http://localhost:3001');
const KEEPALIVE_INTERVAL = 2 * 60 * 1000; // 2 min (more aggressive)
const LS_SYNC_KEY = 'germs_sync_events';
const LS_POLL_INTERVAL = 1500; // Poll localStorage every 1.5s as fallback
const MAX_LS_EVENTS = 100;

// Wake up Render backend immediately on page load
function wakeBackend() {
  fetch(`${WS_URL}/api/health`).catch(() => {});
  fetch(`${WS_URL}/ping`).catch(() => {});
}
if (typeof window !== 'undefined') {
  wakeBackend();
  // Retry wake after 3s in case first attempt fails
  setTimeout(wakeBackend, 3000);
}

class GermsSyncChannel {
  private socket: Socket | null = null;
  private bc: BroadcastChannel | null = null;
  private listeners = new Map<string, Set<Handler>>();
  private connectionListeners = new Set<ConnectionCallback>();
  private myOrigin: 'dashboard' | 'citizen' | 'pro';
  private connected = false;
  private lastProcessedTs = 0;
  private pendingEvents: SyncEvent[] = [];
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null;
  private lsPollTimer: ReturnType<typeof setInterval> | null = null;
  private processedIds = new Set<string>();
  private lastLsCheck = 0;

  constructor(origin: 'dashboard' | 'citizen' | 'pro') {
    this.myOrigin = origin;
    this.lastProcessedTs = Date.now() - 600000;
    this.lastLsCheck = Date.now() - 5000;

    // 1. WebSocket (cross-device)
    try {
      this.socket = io(WS_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
        timeout: 20000,
        forceNew: false,
      });

      this.socket.on('connect', () => {
        this.connected = true;
        console.log(`[Sync:${origin}] WS Connected`);
        this.notifyConnection(true);
        this.socket!.emit('sync-catchup', { lastTs: this.lastProcessedTs });
        // Flush pending
        if (this.pendingEvents.length > 0) {
          for (const event of this.pendingEvents) {
            this.socket!.emit('sync-event', event);
          }
          this.pendingEvents = [];
        }
      });

      this.socket.on('disconnect', () => {
        this.connected = false;
        this.notifyConnection(false);
      });

      this.socket.on('connect_error', () => {
        this.connected = false;
        this.notifyConnection(false);
      });

      this.socket.on('sync-event', (event: SyncEvent) => {
        if (event.origin === this.myOrigin) return;
        this.dispatch(event);
      });

      this.socket.on('sync-catchup-response', (data: { events: SyncEvent[] }) => {
        for (const event of data.events) {
          if (event.origin === this.myOrigin) continue;
          this.dispatch(event);
        }
      });

      this.socket.on('keep-alive-ack', () => {});

    } catch {}

    // 2. BroadcastChannel (same browser, different tabs — instant)
    try {
      this.bc = new BroadcastChannel('germs-sync');
      this.bc.onmessage = (e) => {
        const event = e.data as SyncEvent;
        if (event.origin === this.myOrigin) return;
        this.dispatch(event);
      };
    } catch {}

    // 3. localStorage polling (ultimate fallback — works everywhere)
    this.lsPollTimer = setInterval(() => {
      this.pollLocalStorage();
    }, LS_POLL_INTERVAL);

    // 4. Keep-alive
    this.keepAliveTimer = setInterval(() => {
      if (this.socket && this.connected) {
        this.socket.emit('keep-alive');
      }
      fetch(`${WS_URL}/ping`).catch(() => {});
    }, KEEPALIVE_INTERVAL);

    console.log(`[Sync:${origin}] Init — WS: ${WS_URL}`);
  }

  private dispatch(event: SyncEvent) {
    const eventId = `${event.ts}-${event.type}-${event.origin}`;
    if (this.processedIds.has(eventId)) return;
    this.processedIds.add(eventId);
    if (this.processedIds.size > 500) {
      const arr = Array.from(this.processedIds);
      this.processedIds = new Set(arr.slice(-250));
    }
    if (event.ts > this.lastProcessedTs) this.lastProcessedTs = event.ts;

    const handlers = this.listeners.get(event.type);
    if (handlers && handlers.size > 0) {
      console.log(`[Sync:${this.myOrigin}] <- ${event.type} from ${event.origin}`);
      handlers.forEach(h => {
        try { h(event.payload); } catch (err) { console.error('[Sync] Handler error:', err); }
      });
    }
  }

  // localStorage fallback: write events and poll for new ones
  private writeToLocalStorage(event: SyncEvent) {
    try {
      const raw = localStorage.getItem(LS_SYNC_KEY);
      const events: SyncEvent[] = raw ? JSON.parse(raw) : [];
      events.push(event);
      // Keep only recent events
      const recent = events.filter(e => Date.now() - e.ts < 60000).slice(-MAX_LS_EVENTS);
      localStorage.setItem(LS_SYNC_KEY, JSON.stringify(recent));
    } catch {}
  }

  private pollLocalStorage() {
    try {
      const raw = localStorage.getItem(LS_SYNC_KEY);
      if (!raw) return;
      const events: SyncEvent[] = JSON.parse(raw);
      for (const event of events) {
        if (event.origin === this.myOrigin) continue;
        if (event.ts <= this.lastLsCheck) continue;
        this.dispatch(event);
      }
      this.lastLsCheck = Date.now();
    } catch {}
  }

  send(type: string, payload: any) {
    const event: SyncEvent = { type, payload, origin: this.myOrigin, ts: Date.now() };
    console.log(`[Sync:${this.myOrigin}] -> ${type}`);

    // WebSocket
    if (this.socket && this.connected) {
      this.socket.emit('sync-event', event);
    } else {
      this.pendingEvents.push(event);
    }

    // BroadcastChannel
    try { this.bc?.postMessage(event); } catch {}

    // localStorage fallback (always write — works even if WS and BC fail)
    this.writeToLocalStorage(event);
  }

  on(type: string, handler: Handler): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
    return () => { this.listeners.get(type)?.delete(handler); };
  }

  onConnection(callback: ConnectionCallback): () => void {
    this.connectionListeners.add(callback);
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
    if (this.lsPollTimer) clearInterval(this.lsPollTimer);
    this.socket?.disconnect();
    this.bc?.close();
    this.listeners.clear();
    this.connectionListeners.clear();
  }
}

// Singleton cache — only create ONE instance per origin
const instances = new Map<string, GermsSyncChannel>();

export function createSync(origin: 'dashboard' | 'citizen' | 'pro') {
  if (!instances.has(origin)) {
    instances.set(origin, new GermsSyncChannel(origin));
  }
  return instances.get(origin)!;
}
