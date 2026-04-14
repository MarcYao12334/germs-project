import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(@Query('role') role?: string, @Query('country') country?: string) {
    return this.usersService.findAll(role, country);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
