import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseAdminService } from '../supabase-admin/supabase-admin.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '@prisma/client';
import { CurrentUserI } from '../auth/current-user.interface';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private supabaseAdmin: SupabaseAdminService,
  ) {}

  async createUser(dto: CreateUserDto, currentUser: CurrentUserI) {
    const adminRoles: UserRole[] = [UserRole.HQ_ADMIN, UserRole.BRANCH_ADMIN];
    const uniquePerBranchRoles: UserRole[] = [UserRole.REFUELING_MANAGER, UserRole.FUEL_ADMIN];

    // Only HQ or Branch Admin can create users
    if (!adminRoles.includes(currentUser.role)) {
      throw new ForbiddenException('Not allowed to create users');
    }

    // HQ Admin can only create Branch Admins
    if (currentUser.role === UserRole.HQ_ADMIN) {
      if (dto.role !== UserRole.BRANCH_ADMIN) {
        throw new ForbiddenException('HQ_ADMIN can only create Branch Admins');
      }
      if (!dto.branchId) throw new BadRequestException('Branch ID required for Branch Admin');
    }

    // Branch Admin cannot create admins
    if (currentUser.role === UserRole.BRANCH_ADMIN) {
      dto.branchId = currentUser.branchId;
      if (adminRoles.includes(dto.role)) {
        throw new ForbiddenException('Branch Admin cannot create admins');
      }
    }

    // Ensure unique roles per branch
    if (uniquePerBranchRoles.includes(dto.role)) {
      const exists = await this.prisma.user.findFirst({
        where: { branchId: dto.branchId, role: dto.role, isActive: true },
      });
      if (exists) throw new BadRequestException(`${dto.role} already exists in this branch`);
    }

    // Create user in Supabase (temporary password only)
    const user = await this.supabaseAdmin.createUserWithPassword(dto.email, dto.role);

    // Save user in local DB
    return this.prisma.user.create({
      data: {
        id: user.id, // Supabase UUID
        fullName: dto.fullName,
        email: dto.email,
        role: dto.role,
        branchId: dto.branchId,
        phoneNumber: dto.phoneNumber,
        employeeId: dto.employeeId,
      },
    });
  }

  async getUsers(currentUser: CurrentUserI) {
    if (currentUser.role === UserRole.HQ_ADMIN) {
      return this.prisma.user.findMany({ include: { branch: true } });
    }

    if (currentUser.role === UserRole.BRANCH_ADMIN) {
      return this.prisma.user.findMany({ where: { branchId: currentUser.branchId } });
    }

    throw new ForbiddenException('Not allowed to view users');
  }

  async getUserById(id: string, currentUser: CurrentUserI) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (currentUser.role === UserRole.BRANCH_ADMIN && user.branchId !== currentUser.branchId) {
      throw new ForbiddenException('Cannot view users outside your branch');
    }

    return user;
  }

  async deactivateUser(id: string, currentUser: CurrentUserI) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const adminRoles: UserRole[] = [UserRole.HQ_ADMIN, UserRole.BRANCH_ADMIN];

    if (currentUser.role === UserRole.HQ_ADMIN && user.role === UserRole.HQ_ADMIN) {
      throw new ForbiddenException('Cannot deactivate another HQ Admin');
    }

    if (currentUser.role === UserRole.BRANCH_ADMIN && user.branchId !== currentUser.branchId) {
      throw new ForbiddenException('Cannot deactivate users outside your branch');
    }

    if (currentUser.role === UserRole.BRANCH_ADMIN && adminRoles.includes(user.role)) {
      throw new ForbiddenException('Branch Admin cannot deactivate admins');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
