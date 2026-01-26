import { Injectable, ForbiddenException, BadRequestException, NotFoundException} from '@nestjs/common';
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

    // Authorization rules
    if (currentUser.role !== UserRole.HQ_ADMIN &&
        currentUser.role !== UserRole.BRANCH_ADMIN) {
      throw new ForbiddenException('Not allowed to create users');
    }

    // HQ_ADMIN rules
    if (currentUser.role === UserRole.HQ_ADMIN) {
      // Can only create Branch Admin
      if (dto.role !== UserRole.BRANCH_ADMIN) {
        throw new ForbiddenException('HQ_ADMIN can only create Branch Admins');
      }
      // Must provide branchId from the branch they created
      if (!dto.branchId) {
        throw new BadRequestException('Branch ID required for Branch Admin');
      }
  }

    // Branch Admin rules
    if (currentUser.role === UserRole.BRANCH_ADMIN) {
      // Force branchId to their own
      dto.branchId = currentUser.branchId;
      // Cannot create HQ or Branch Admin
      if (  dto.role === UserRole.HQ_ADMIN ||
        dto.role === UserRole.BRANCH_ADMIN) {
        throw new ForbiddenException('Branch Admin cannot create admins');
      }
    }
   
  

    // Invite user via Supabase
   const user = await this.supabaseAdmin.inviteUserByEmail(dto.email);

    // Create user in local DB
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
    // HQ sees all users
    return this.prisma.user.findMany({
      include: { branch: true },
    });
  }

  if (currentUser.role === UserRole.BRANCH_ADMIN) {
    // Branch Admin sees only users in their branch
    return this.prisma.user.findMany({
      where: { branchId: currentUser.branchId },
    });
  }

  // Other roles cannot list users
  throw new ForbiddenException('Not allowed to view users');
}

async getUserById(id: string, currentUser: CurrentUserI) {
  const user = await this.prisma.user.findUnique({ where: { id } });

  if (!user) throw new NotFoundException('User not found');

  // Authorization
  if (
    currentUser.role === UserRole.BRANCH_ADMIN &&
    user.branchId !== currentUser.branchId
  ) {
    throw new ForbiddenException('Cannot view users outside your branch');
  }

  return user;
}


async deactivateUser(id: string, currentUser: CurrentUserI) {
  const user = await this.prisma.user.findUnique({ where: { id } });

  if (!user) throw new NotFoundException('User not found');

  // HQ_ADMIN can deactivate anyone except other HQ_ADMINs
  if (
    currentUser.role === UserRole.HQ_ADMIN &&
    user.role === UserRole.HQ_ADMIN
  ) {
    throw new ForbiddenException('Cannot deactivate another HQ Admin');
  }

  // Branch Admin can only deactivate branch users in their branch
  if (
    currentUser.role === UserRole.BRANCH_ADMIN &&
    user.branchId !== currentUser.branchId
  ) {
    throw new ForbiddenException('Cannot deactivate users outside your branch');
  }

  if (
    currentUser.role === UserRole.BRANCH_ADMIN &&
      (user.role === 'HQ_ADMIN' || user.role === 'BRANCH_ADMIN')
  ) {
    throw new ForbiddenException('Branch Admin cannot deactivate admins');
  }

  return this.prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
}

}
