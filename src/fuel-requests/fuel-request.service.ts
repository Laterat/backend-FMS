import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FuelRequestStatus, UserRole, FuelSessionStatus } from '@prisma/client';

@Injectable()
export class FuelRequestService {
  constructor(private readonly prisma: PrismaService) {}

  // ================= Create Fuel Request (Driver) =================
  async createRequest(sessionId: string, driver: any, amount: number) {
    const session = await this.prisma.fuelSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Fuel session not found');
    if (session.driverId !== driver.id)
      throw new ForbiddenException('Driver not part of this session');
    if (session.status !== FuelSessionStatus.OPEN)
      throw new ForbiddenException('Cannot request fuel in closed session');

    return this.prisma.fuelRequest.create({
      data: {
        fuelSessionId: sessionId,
        requestedById: driver.id,
        requestedAmount: amount,
        status: FuelRequestStatus.PENDING,
      },
    });
  }

  // ================= Review Fuel Request (Refuel Manager) =================
  async reviewRequest(requestId: string, manager: any, approve: boolean, comment?: string) {
    const request = await this.prisma.fuelRequest.findUnique({
      where: { id: requestId },
      include: { fuelSession: true },
    });

    if (!request) throw new NotFoundException('Fuel request not found');

    // Only manager of same branch can review
    if (manager.role !== UserRole.REFUELING_MANAGER)
      throw new ForbiddenException('Only refuel manager can review requests');
    if (manager.branchId !== request.fuelSession.branchId)
      throw new ForbiddenException('Cannot review request outside your branch');

    if (request.status !== FuelRequestStatus.PENDING)
      throw new BadRequestException('Request already reviewed');

    const status = approve ? FuelRequestStatus.APPROVED : FuelRequestStatus.REJECTED;

    return this.prisma.fuelRequest.update({
      where: { id: requestId },
      data: {
        status,
        approvedById: manager.id,
        managerComment: comment,
      },
    });
  }
}
