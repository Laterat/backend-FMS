import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // 🔹 Branch fuel usage summary
  async branchFuelSummary(branchId: string) {
    return this.prisma.fuelSession.aggregate({
      where: { branchId },
      _count: { id: true },
    });
  }

  // 🔹 Vehicle consumption report
  async vehicleConsumption(vehicleId: string) {
    return this.prisma.fuelConsumptionAnalysis.findMany({
      where: {
        fuelSession: { vehicleId },
      },
      select: {
        expectedConsumption: true,
        actualConsumption: true,
        variance: true,
        flagged: true,
      },
    });
  }

  // 🔹 Driver fuel behavior
  async driverFuelUsage(driverId: string) {
    return this.prisma.fuelRequest.findMany({
      where: { requestedById: driverId },
      select: {
        requestedAmount: true,
        approvedAmount: true,
        status: true,
        createdAt: true,
      },
    });
  }

  // 🔹 Finance report
  async financeSummary() {
    return this.prisma.financeTransaction.aggregate({
      _sum: { amount: true },
      _count: { id: true },
    });
  }

  // 🔹 Fraud / flagged sessions
  async flaggedSessions() {
    return this.prisma.fraudCase.findMany({
      include: {
        fuelSession: {
          include: {
            vehicle: true,
            driver: true,
          },
        },
      },
    });
  }
}
