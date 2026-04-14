import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  findAll(@Query('country') country?: string) {
    return this.teamsService.findAll(country);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.teamsService.create(body);
  }

  @Post(':id/position')
  updatePosition(@Param('id') id: string, @Body() body: { lat: number; lng: number; accuracy?: number }) {
    return this.teamsService.updatePosition(id, body);
  }

  @Post(':id/rate')
  rateTeam(@Param('id') id: string, @Body() body: { interventionId: string; citizenId: string; note: number; commentaire?: string }) {
    return this.teamsService.rateTeam(id, body);
  }
}
