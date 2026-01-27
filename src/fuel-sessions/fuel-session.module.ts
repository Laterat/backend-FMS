import { Module } from '@nestjs/common';
import { FuelSessionService } from './fuel-session.service';
import { FuelSessionController } from './fuel-session.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FuelSessionService],
  controllers: [FuelSessionController],
})
export class FuelSessionModule {}
