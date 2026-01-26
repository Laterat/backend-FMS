// src/branch/branch.controller.ts
import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('branches')
export class BranchController {
  constructor(private branchService: BranchService) {}

  @Post()
  @UseGuards(SupabaseJwtGuard, RolesGuard)
  @Roles(UserRole.HQ_ADMIN)
  createBranch(@Body() dto: CreateBranchDto, @CurrentUser() user) {
    return this.branchService.createBranch(dto, user);
  }

@Get()
@UseGuards(SupabaseJwtGuard)
getBranches(@CurrentUser() user) {
  return this.branchService.getBranches(user);
}

}
