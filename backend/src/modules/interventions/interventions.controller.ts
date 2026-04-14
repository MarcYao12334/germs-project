import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { InterventionsService } from './interventions.service';

@Controller('interventions')
export class InterventionsController {
  constructor(private interventionsService: InterventionsService) {}

  @Get()
  findAll(@Query('country') country?: string, @Query('status') status?: string) {
    return this.interventionsService.findAll(country, status);
  }

  @Get('stats')
  getStats(@Query('country') country?: string) {
    return this.interventionsService.getStats(country);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interventionsService.findOne(id);
  }

  @Post()
  createFromAlert(@Body() body: { alertId: string; operatorId: string }) {
    return this.interventionsService.createFromAlert(body.alertId, body.operatorId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string; version: number }) {
    return this.interventionsService.updateStatus(id, body.status, body.version);
  }

  @Patch(':id/assign')
  assignTeam(@Param('id') id: string, @Body() body: { teamId: string }) {
    return this.interventionsService.assignTeam(id, body.teamId);
  }

  @Patch(':id/bilan')
  submitBilan(@Param('id') id: string, @Body() body: any) {
    return this.interventionsService.submitBilan(id, body);
  }
}
