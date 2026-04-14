import { Module } from '@nestjs/common';
import { InterventionsController } from './interventions.controller';
import { InterventionsService } from './interventions.service';
import { WebsocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [WebsocketModule],
  controllers: [InterventionsController],
  providers: [InterventionsService],
})
export class InterventionsModule {}
