import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'germs-backend',
      version: '1.0.0',
    };
  }

  @Get('ready')
  ready() {
    return { status: 'ready' };
  }
}
