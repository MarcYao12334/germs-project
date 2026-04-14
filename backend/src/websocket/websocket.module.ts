import { Module } from '@nestjs/common';
import { GermsGateway } from './germs.gateway';
import { EventEmitterService } from './event-emitter.service';

@Module({
  providers: [GermsGateway, EventEmitterService],
  exports: [EventEmitterService],
})
export class WebsocketModule {}
