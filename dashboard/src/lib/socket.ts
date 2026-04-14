import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

class SocketClient {
  socket: Socket | null = null;
  listeners: Map<string, Set<Function>> = new Map();

  connect(token?: string) {
    this.socket = io(WS_URL, {
      auth: token ? { token } : {},
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('[WS] Connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WS] Disconnected:', reason);
    });

    // Re-attach listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(cb => this.socket?.on(event, cb as any));
    });
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);
    this.socket?.on(event, callback as any);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
    this.socket?.off(event, callback as any);
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export const socketClient = new SocketClient();
