import { Injectable, Logger } from '@nestjs/common';
import { GermsGateway } from './germs.gateway';

@Injectable()
export class EventEmitterService {
  private logger = new Logger('EventEmitter');

  constructor(private gateway: GermsGateway) {}

  emitToUser(userId: string, event: string, data: any) {
    this.gateway.server?.to(`user:${userId}`).emit(event, { ...data, sentAt: new Date() });
    this.logger.debug(`Event '${event}' sent to user ${userId}`);
  }

  emitToCountry(country: string, event: string, data: any) {
    this.gateway.server?.to(`country:${country}`).emit(event, { ...data, country, sentAt: new Date() });
    this.logger.debug(`Event '${event}' sent to country ${country}`);
  }

  emitToRole(role: string, event: string, data: any) {
    this.gateway.server?.to(`role:${role}`).emit(event, { ...data, sentAt: new Date() });
    this.logger.debug(`Event '${event}' sent to role ${role}`);
  }

  emitToIntervention(interventionId: string, event: string, data: any) {
    this.gateway.server?.to(`intervention:${interventionId}`).emit(event, { ...data, interventionId, sentAt: new Date() });
    this.logger.debug(`Event '${event}' sent to intervention ${interventionId}`);
  }

  emitGlobal(event: string, data: any) {
    this.gateway.server?.emit(event, { ...data, sentAt: new Date() });
    this.logger.debug(`Global event '${event}' broadcasted`);
  }
}
