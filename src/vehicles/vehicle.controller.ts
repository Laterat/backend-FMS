import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { VehiclesService } from './vehicle.service';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { CurrentUserI } from '../auth/current-user.interface';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  // READ vehicles - all roles
  @Get()
  @UseGuards(SupabaseJwtGuard)
  getVehicles(@CurrentUser() user: CurrentUserI) {
    return this.vehiclesService.getVehicles(user);
  }

  // CREATE vehicle - only FUEL_ADMIN
  @Post()
  @UseGuards(SupabaseJwtGuard, RolesGuard)
  @Roles(UserRole.FUEL_ADMIN)
  createVehicle(@Body() dto: CreateVehicleDto, @CurrentUser() user: CurrentUserI) {
    return this.vehiclesService.createVehicle(dto, user);
  }

  // UPDATE vehicle - only FUEL_ADMIN
  @Patch(':id')
  @UseGuards(SupabaseJwtGuard, RolesGuard)
  @Roles(UserRole.FUEL_ADMIN)
  updateVehicle(@Param('id') id: string, @Body() dto: UpdateVehicleDto, @CurrentUser() user: CurrentUserI) {
    return this.vehiclesService.updateVehicle(id, dto, user);
  }
}
