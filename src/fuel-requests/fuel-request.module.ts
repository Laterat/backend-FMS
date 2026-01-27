// src/fuel-requests/fuel-request.module.ts
import { Module } from '@nestjs/common';
import { FuelRequestService } from './fuel-request.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FuelRequestService],
  exports: [FuelRequestService],
})
export class FuelRequestModule {}
