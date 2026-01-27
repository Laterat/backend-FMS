import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicle.service';
import { VehiclesController } from './vehicle.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [VehiclesController],
  providers: [VehiclesService, PrismaService],
  exports: [VehiclesService],
})
export class VehicleModule {}
