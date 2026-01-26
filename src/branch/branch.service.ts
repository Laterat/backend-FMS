// src/branch/branch.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UserRole } from '@prisma/client';
import { CurrentUserI } from '../auth/current-user.interface';

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) {}

  async createBranch(dto: CreateBranchDto, currentUser: CurrentUserI) {
  if (currentUser.role !== UserRole.HQ_ADMIN) {
    throw new ForbiddenException('Only HQ Admin can create branches');
  }

  return this.prisma.branch.create({ data: dto });
}


 async getBranches(currentUser: CurrentUserI) {
  // HQ sees everything
  if (currentUser.role === UserRole.HQ_ADMIN) {
    return this.prisma.branch.findMany();
  }

  // Branch admin sees ONLY their branch
  return this.prisma.branch.findMany({
    where: { id: currentUser.branchId },
  });
}

}
