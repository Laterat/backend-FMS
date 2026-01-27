import { Controller, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { FuelRequestService } from './fuel-request.service';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { CurrentUserI } from '../auth/current-user.interface';

@Controller('fuel-request')
@UseGuards(SupabaseJwtGuard, RolesGuard)
export class FuelRequestController {
  constructor(private readonly service: FuelRequestService) {}

  // ================= Driver: Create Fuel Request =================
  @Post(':sessionId')
  @Roles(UserRole.DRIVER)
  createRequest(
    @Param('sessionId') sessionId: string,
    @Body('amount') amount: number,
    @CurrentUser() user: CurrentUserI,
  ) {
    return this.service.createRequest(sessionId, user, amount);
  }

  // ================= Refuel Manager: Review Fuel Request =================
  @Patch(':id/review')
  @Roles(UserRole.REFUELING_MANAGER)
  reviewRequest(
    @Param('id') id: string,
    @Body('approve') approve: boolean,
    @Body('comment') comment: string,
    @CurrentUser() user: CurrentUserI,
  ) {
    return this.service.reviewRequest(id, user, approve, comment);
  }

  // ================= Optionally: Get Fuel Requests =================
  // Can add GET endpoints for drivers/managers if needed
}
