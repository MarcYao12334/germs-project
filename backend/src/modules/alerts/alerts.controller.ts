import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Get()
  findAll(@Query('country') country?: string, @Query('status') status?: string) {
    return this.alertsService.findAll(country, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.alertsService.create(body);
  }

  @Patch(':id/validate')
  validate(@Param('id') id: string, @Body() body: { operatorId: string }) {
    return this.alertsService.validate(id, body.operatorId);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() body: { motif: string }) {
    return this.alertsService.reject(id, body.motif);
  }
}
