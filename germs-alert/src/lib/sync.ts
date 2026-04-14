import { SyncEvent } from '../types';

// Cross-port sync via localStorage polling
// BroadcastChannel doesn't work across different ports (different origins)
// So we use localStorage with a shared key prefix and polling

type Handler = (payload: any) => void;

const SYNC_KEY = 'germs_sync_queue';
const POLL_INTERVAL = 500; // ms

class GermsSyncChannel {
  private listeners = new Map<string, Set<Handler>>();
  private origin: 'citizen' | 'dashboard';
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private lastProcessedTs = 0;

  constructor(origin: 'citizen' | 'dashboard') {
    this.origin = origin;
    this.startPolling();
  }

  private startPolling() {
    // Poll localStorage for new events from the other app
    this.pollTimer = setInterval(() => {
      this.processQueue();
    }, POLL_INTERVAL);

    // Also listen for storage events (works when same origin)
    window.addEventListener('storage', (e) => {
      if (e.key === SYNC_KEY) this.processQueue();
    });
  }

  private processQueue() {
    try {
      const raw = localStorage.getItem(SYNC_KEY);
      if (!raw) return;
      const queue: SyncEvent[] = JSON.parse(raw);
      const newEvents = queue.filter(
        e => e.origin !== this.origin && e.ts > this.lastProcessedTs
      );
      for (const event of newEvents) {
        this.lastProcessedTs = event.ts;
        const handlers = this.listeners.get(event.type);
        handlers?.forEach(h => h(event.payload));
      }
    } catch {}
  }

  send(type: string, payload: any) {
    const event: SyncEvent = { type, payload, origin: this.origin, ts: Date.now() };
    try {
      const raw = localStorage.getItem(SYNC_KEY);
      const queue: SyncEvent[] = raw ? JSON.parse(raw) : [];
      queue.push(event);
      // Keep only last 50 events and last 60 seconds
      const cutoff = Date.now() - 60000;
      const trimmed = queue.filter(e => e.ts > cutoff).slice(-50);
      localStorage.setItem(SYNC_KEY, JSON.stringify(trimmed));
    } catch {}
  }

  on(type: string, handler: Handler): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
    return () => { this.listeners.get(type)?.delete(handler); };
  }

  destroy() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.listeners.clear();
  }
}

export const citizenSync = new GermsSyncChannel('citizen');
