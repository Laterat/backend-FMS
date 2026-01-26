// src/branch/branch.module.ts
import { Module } from '@nestjs/common';
import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [BranchService, PrismaService],
  controllers: [BranchController],
  exports: [BranchService],
})
export class BranchModule {}
