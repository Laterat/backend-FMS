import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

async processTransaction(dto: CreateTransactionDto, financeUserId: string) {
  const request = await this.prisma.fuelRequest.findUnique({
    where: { id: dto.fuelRequestId },
  });

  if (!request || request.status !== 'APPROVED') {
    throw new BadRequestException('Fuel request not approved');
  }

  return this.prisma.financeTransaction.create({
    data: {
      fuelRequestId: dto.fuelRequestId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      reference: dto.reference,
      processedById: financeUserId,
    },
  });
}

  // REPORTS
  async branchFuelCostReport(branchId: string) {
    return this.prisma.financeTransaction.findMany({
      where: {
        fuelRequest: {
          fuelSession: { branchId },
        },
      },
      include: {
        fuelRequest: true,
      },
    });
  }
}
