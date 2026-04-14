// Universal sync — WebSocket (cross-device) + BroadcastChannel (same-browser fallback)
// Used by Dashboard, GERMS Alert, and GERMS Pro
import { io, Socket } from 'socket.io-client';

interface SyncEvent {
  type: string;
  payload: any;
  origin: 'dashboard' | 'citizen' | 'pro';
  ts: number;
}

type Handler = (payload: any) => void;

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

class GermsSyncChannel {
  private socket: Socket | null = null;
  private bc: BroadcastChannel | null = null;
  private listeners = new Map<string, Set<Handler>>();
  private myOrigin: 'dashboard' | 'citizen' | 'pro';
  private connected = false;

  constructor(origin: 'dashboard' | 'citizen' | 'pro') {
    this.myOrigin = origin;

    // 1. WebSocket (cross-device)
    try {
      this.socket = io(WS_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 50,
      });
      this.socket.on('connect', () => {
        this.connected = true;
        console.log(`[Sync:${origin}] WebSocket connected to ${WS_URL}`);
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
      console.log(`[Sync:${origin}] WebSocket failed, using BroadcastChannel only`);
    }

    // 2. BroadcastChannel (same-browser, instant)
    try {
      this.bc = new BroadcastChannel('germs-sync');
      this.bc.onmessage = (e) => {
        const event = e.data as SyncEvent;
        if (event.origin === this.myOrigin) return;
        this.dispatch(event);
      };
    } catch {}

    console.log(`[Sync:${origin}] Initialized (WS: ${WS_URL})`);
  }

  private dispatch(event: SyncEvent) {
    const handlers = this.listeners.get(event.type);
    if (handlers && handlers.size > 0) {
      console.log(`[Sync:${this.myOrigin}] Received ${event.type} from ${event.origin} (${handlers.size} handlers)`);
      handlers.forEach(h => h(event.payload));
    }
  }

  send(type: string, payload: any) {
    const event: SyncEvent = { type, payload, origin: this.myOrigin, ts: Date.now() };
    console.log(`[Sync:${this.myOrigin}] Sending: ${type}`);

    // Send via WebSocket (cross-device)
    if (this.socket) {
      this.socket.emit('sync-event', event);
    }

    // Also send via BroadcastChannel (same-browser, instant)
    try {
      this.bc?.postMessage(event);
    } catch {}
  }

  on(type: string, handler: Handler): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
    return () => { this.listeners.get(type)?.delete(handler); };
  }

  destroy() {
    this.socket?.disconnect();
    this.bc?.close();
    this.listeners.clear();
  }
}

export function createSync(origin: 'dashboard' | 'citizen' | 'pro') {
  return new GermsSyncChannel(origin);
}
