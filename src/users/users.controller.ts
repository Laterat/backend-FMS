import { Controller, Post,Patch, Get, Body, UseGuards, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { CurrentUserI } from '../auth/current-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(SupabaseJwtGuard, RolesGuard)
  @Roles(UserRole.HQ_ADMIN, UserRole.BRANCH_ADMIN)
  createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser() user,
  ) {
    return this.usersService.createUser(dto, user);
  }

  @Get()
  @UseGuards(SupabaseJwtGuard)
  getUsers(@CurrentUser() user: CurrentUserI) {
  return this.usersService.getUsers(user);
}

@Get(':id')
@UseGuards(SupabaseJwtGuard)
getUser(@Param('id') id: string, @CurrentUser() user: CurrentUserI) {
  return this.usersService.getUserById(id, user);
}

@Patch(':id/deactivate')
@UseGuards(SupabaseJwtGuard, RolesGuard)
@Roles(UserRole.HQ_ADMIN, UserRole.BRANCH_ADMIN)
deactivateUser(@Param('id') id: string, @CurrentUser() user: CurrentUserI) {
  return this.usersService.deactivateUser(id, user);
}

}
