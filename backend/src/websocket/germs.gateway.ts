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

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
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
        // Allow unauthenticated connections in dev
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
}
