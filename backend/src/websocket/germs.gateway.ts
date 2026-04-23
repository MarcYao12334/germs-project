import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface SyncEvent {
  type: string;
  payload: any;
  origin: 'dashboard' | 'citizen' | 'pro';
  ts: number;
}

@WebSocketGateway({
  cors: {
    origin: true, // Accept all origins
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingInterval: 30000,
  pingTimeout: 60000,
})
export class GermsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('GermsGateway');

  // In-memory event buffer for catchup (last 10 minutes, max 500 events)
  private eventBuffer: SyncEvent[] = [];
  private readonly MAX_BUFFER_SIZE = 500;
  private readonly BUFFER_TTL_MS = 10 * 60 * 1000; // 10 minutes

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (token) {
        const user = this.jwtService.verify(token);
        client.data.user = user;
        client.data.userId = user.userId;
        client.data.role = user.role;
        client.data.country = user.country;
        client.join(`user:${user.userId}`);
        client.join(`country:${user.country}`);
        client.join(`role:${user.role}`);
        this.logger.log(`User ${user.userId} connected: ${client.id}`);
      } else {
        client.data.userId = 'anonymous';
        this.logger.log(`Anonymous connection: ${client.id}`);
      }
    } catch (err) {
      this.logger.warn(`Auth failed for ${client.id}: ${err.message}`);
      client.data.userId = 'anonymous';
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    if (client.data.country) {
      this.server.to(`country:${client.data.country}`).emit('user:offline', {
        userId: client.data.userId,
        timestamp: new Date(),
      });
    }
  }

  // ══════════════════════════════════════════
  //  SYNC-EVENT: Relay events between all apps
  //  (Dashboard ↔ Citizen ↔ Pro)
  // ══════════════════════════════════════════
  @SubscribeMessage('sync-event')
  handleSyncEvent(@ConnectedSocket() client: Socket, @MessageBody() event: SyncEvent) {
    this.logger.debug(`[Sync] ${event.origin} → ${event.type}`);

    // Store in buffer for catchup
    this.eventBuffer.push(event);
    this.pruneBuffer();

    // Broadcast to ALL other connected clients (except sender)
    client.broadcast.emit('sync-event', event);
  }

  // ══════════════════════════════════════════
  //  SYNC-CATCHUP: Send missed events to a client
  // ══════════════════════════════════════════
  @SubscribeMessage('sync-catchup')
  handleSyncCatchup(@ConnectedSocket() client: Socket, @MessageBody() data: { lastTs: number }) {
    const missedEvents = this.eventBuffer.filter(e => e.ts > (data.lastTs || 0));
    this.logger.debug(`[Sync] Catchup for ${client.id}: ${missedEvents.length} events since ${data.lastTs}`);
    client.emit('sync-catchup-response', { events: missedEvents });
  }

  // ══════════════════════════════════════════
  //  KEEP-ALIVE: Prevent connection timeout
  // ══════════════════════════════════════════
  @SubscribeMessage('keep-alive')
  handleKeepAlive(@ConnectedSocket() client: Socket) {
    client.emit('keep-alive-ack', { ts: Date.now() });
  }

  // ══════════════════════════════════════════
  //  Existing handlers
  // ══════════════════════════════════════════
  @SubscribeMessage('join:intervention')
  handleJoinIntervention(@ConnectedSocket() client: Socket, @MessageBody() data: { interventionId: string }) {
    client.join(`intervention:${data.interventionId}`);
    this.logger.debug(`${client.data.userId} joined intervention:${data.interventionId}`);
  }

  @SubscribeMessage('position:update')
  handlePositionUpdate(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    if (data.interventionId) {
      this.server.to(`intervention:${data.interventionId}`).emit('position:updated', {
        teamId: data.teamId,
        lat: data.lat,
        lng: data.lng,
        accuracy: data.accuracy,
        timestamp: new Date(),
      });
    }
    if (client.data.country) {
      this.server.to(`country:${client.data.country}`).emit('position:updated', {
        teamId: data.teamId,
        lat: data.lat,
        lng: data.lng,
        timestamp: new Date(),
      });
    }
  }

  @SubscribeMessage('intervention:status-change')
  handleStatusChange(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    this.server.to(`intervention:${data.interventionId}`).emit('intervention:status-changed', {
      interventionId: data.interventionId,
      status: data.newStatus,
      updatedBy: client.data.userId,
      timestamp: new Date(),
    });
    if (client.data.country) {
      this.server.to(`country:${client.data.country}`).emit('intervention:updated', {
        interventionId: data.interventionId,
        status: data.newStatus,
        timestamp: new Date(),
      });
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date() });
  }

  // Prune old events from buffer
  private pruneBuffer() {
    const cutoff = Date.now() - this.BUFFER_TTL_MS;
    this.eventBuffer = this.eventBuffer.filter(e => e.ts > cutoff);
    if (this.eventBuffer.length > this.MAX_BUFFER_SIZE) {
      this.eventBuffer = this.eventBuffer.slice(-this.MAX_BUFFER_SIZE);
    }
  }
}
