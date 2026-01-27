import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FuelSessionService } from './fuel-session.service';
import { CreateFuelSessionDto } from './dto/create-fuel-session.dto';
import { RecordInitialStateDto } from './dto/record-initial-state.dto';
import { CreateMetadataDto } from './dto/record-metadata.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { CurrentUserI } from '../auth/current-user.interface';

@Controller('fuel-session')
@UseGuards(SupabaseJwtGuard, RolesGuard)
export class FuelSessionController {
  constructor(private readonly service: FuelSessionService) {}

  // ================= Create Fuel Session =================
  @Post()
  @Roles(UserRole.REFUELING_TEAM)
  createSession(
    @Body() dto: CreateFuelSessionDto,
    @CurrentUser() user: CurrentUserI,
  ) {
    return this.service.createSession(dto, user);
  }

  // ================= Record Initial State =================
  @Patch(':id/initial-state')
  @Roles(UserRole.REFUELING_TEAM)
  recordInitialState(
    @Param('id') id: string,
    @Body() dto: RecordInitialStateDto,
    @CurrentUser() user: CurrentUserI,
  ) {
    return this.service.recordInitialState(id, dto, user);
  }

  // ================= CREATE Metadata (FIRST TIME) =================
  @Post(':id/metadata')
  @Roles(UserRole.REFUELING_TEAM)
  createMetadata(
    @Param('id') id: string,
    @Body() dto: CreateMetadataDto,
    @CurrentUser() user: CurrentUserI,
  ) {
    return this.service.createMetadata(id, dto, user);
  }

  // ================= UPDATE Metadata =================
  @Patch(':id/metadata')
  @Roles(UserRole.REFUELING_TEAM)
  updateMetadata(
    @Param('id') id: string,
    @Body() dto: UpdateMetadataDto,
    @CurrentUser() user: CurrentUserI,
  ) {
    return this.service.updateMetadata(id, dto, user);
  }

  // ================= Get Session =================
  @Get(':id')
  @Roles(
    UserRole.REFUELING_TEAM,
    UserRole.BRANCH_ADMIN,
    UserRole.HQ_ADMIN,
    UserRole.REFUELING_MANAGER,
  )
  getSession(@Param('id') id: string, @CurrentUser() user: CurrentUserI) {
    return this.service.getSession(id, user);
  }

  // ================= Driver Requests Fuel =================
  @Post(':id/request-fuel')
  @Roles(UserRole.DRIVER)
  requestFuel(
    @Param('id') sessionId: string,
    @Body('amount') amount: number,
    @CurrentUser() user: CurrentUserI,
  ) {
    return this.service.submitFuelRequest(sessionId, user, amount);
  }

  // ================= Refuel Manager Approves / Rejects =================
  @Patch('fuel-request/:id/approve')
  @Roles(UserRole.REFUELING_MANAGER)
  approveFuelRequest(
    @Param('id') requestId: string,
    @Body('approvedAmount') approvedAmount: number,
    @Body('comment') comment: string,
    @CurrentUser() user: CurrentUserI,
  ) {
    return this.service.approveFuelRequest(
      requestId,
      approvedAmount,
      comment,
      user,
    );
  }

  @Patch('fuel-request/:id/reject')
  @Roles(UserRole.REFUELING_MANAGER)
  rejectFuelRequest(
    @Param('id') requestId: string,
    @Body('comment') comment: string,
    @CurrentUser() user: CurrentUserI,
  ) {
    return this.service.rejectFuelRequest(requestId, comment, user);
  }

  // ================= Close Fuel Session =================
  @Patch(':id/close')
  @Roles(UserRole.REFUELING_TEAM)
  closeSession(@Param('id') id: string, @CurrentUser() user: CurrentUserI) {
    return this.service.closeSession(id, user);
  }
}
