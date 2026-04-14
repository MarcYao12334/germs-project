import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { WebsocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [WebsocketModule],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}
