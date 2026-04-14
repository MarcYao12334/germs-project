import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { telephone: string; password: string }) {
    return this.authService.login(body.telephone, body.password);
  }

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('verify-2fa')
  @HttpCode(200)
  async verify2fa(@Body() body: { userId: string; code: string }) {
    return this.authService.verify2fa(body.userId, body.code);
  }
}
