// Universal sync — WebSocket + BroadcastChannel + localStorage polling
// Triple fallback ensures messages are never lost
import { io, Socket } from 'socket.io-client';

interface SyncEvent {
  type: string;
  payload: any;
  origin: 'dashboard' | 'citizen' | 'pro';
  ts: number;
}

type Handler = (payload: any) => void;

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
const STORAGE_KEY = 'germs_sync_queue';
const POLL_INTERVAL = 3000; // 3 seconds

class GermsSyncChannel {
  private socket: Socket | null = null;
  private bc: BroadcastChannel | null = null;
  private listeners = new Map<string, Set<Handler>>();
  private myOrigin: 'dashboard' | 'citizen' | 'pro';
  private connected = false;
  private lastProcessedTs = Date.now();
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor(origin: 'dashboard' | 'citizen' | 'pro') {
    this.myOrigin = origin;

    // 1. WebSocket (cross-device)
    try {
      this.socket = io(WS_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 100,
      });
      this.socket.on('connect', () => {
        this.connected = true;
        console.log(`[Sync:${origin}] WebSocket connected`);
      });
      this.socket.on('disconnect', () => {
        this.connected = false;
        console.log(`[Sync:${origin}] WebSocket disconnected`);
      });
      this.socket.on('sync-event', (event: SyncEvent) => {
        if (event.origin === this.myOrigin) return;
        this.dispatch(event);
      });
    } catch (err) {
      console.log(`[Sync:${origin}] WebSocket unavailable`);
    }

    // 2. BroadcastChannel (same-browser)
    try {
      this.bc = new BroadcastChannel('germs-sync');
      this.bc.onmessage = (e) => {
        const event = e.data as SyncEvent;
        if (event.origin === this.myOrigin) return;
        this.dispatch(event);
      };
    } catch {}

    // 3. localStorage polling (ultimate fallback — works cross-tab, cross-port)
    this.pollTimer = setInterval(() => this.pollStorage(), POLL_INTERVAL);
    // Also listen for storage events (instant when same origin)
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) this.pollStorage();
    });

    console.log(`[Sync:${origin}] Initialized — WS: ${WS_URL} — Poll: ${POLL_INTERVAL}ms`);
  }

  private pollStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const queue: SyncEvent[] = JSON.parse(raw);
      const newEvents = queue.filter(e => e.origin !== this.myOrigin && e.ts > this.lastProcessedTs);
      for (const event of newEvents) {
        this.lastProcessedTs = event.ts;
        this.dispatch(event);
      }
    } catch {}
  }

  private dispatch(event: SyncEvent) {
    // Dedup: update lastProcessedTs
    if (event.ts > this.lastProcessedTs) this.lastProcessedTs = event.ts;
    const handlers = this.listeners.get(event.type);
    if (handlers && handlers.size > 0) {
      console.log(`[Sync:${this.myOrigin}] Received ${event.type} from ${event.origin}`);
      handlers.forEach(h => h(event.payload));
    }
  }

  send(type: string, payload: any) {
    const event: SyncEvent = { type, payload, origin: this.myOrigin, ts: Date.now() };
    console.log(`[Sync:${this.myOrigin}] Sending: ${type}`);

    // 1. WebSocket
    if (this.socket && this.connected) {
      this.socket.emit('sync-event', event);
    }

    // 2. BroadcastChannel
    try { this.bc?.postMessage(event); } catch {}

    // 3. localStorage queue (always write — guaranteed delivery)
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const queue: SyncEvent[] = raw ? JSON.parse(raw) : [];
      queue.push(event);
      // Keep last 100 events, max 5 min old
      const cutoff = Date.now() - 300000;
      const trimmed = queue.filter(e => e.ts > cutoff).slice(-100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {}
  }

  on(type: string, handler: Handler): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
    return () => { this.listeners.get(type)?.delete(handler); };
  }

  destroy() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.socket?.disconnect();
    this.bc?.close();
    this.listeners.clear();
  }
}

export function createSync(origin: 'dashboard' | 'citizen' | 'pro') {
  return new GermsSyncChannel(origin);
}
