import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFuelSessionDto } from './dto/create-fuel-session.dto';
import { RecordInitialStateDto } from './dto/record-initial-state.dto';
import { CreateMetadataDto } from './dto/record-metadata.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';

import {
  UserRole,
  FuelSessionStatus,
  FuelRequestStatus,
} from '@prisma/client';
import { CurrentUserI } from '../auth/current-user.interface';

@Injectable()
export class FuelSessionService {
  constructor(private readonly prisma: PrismaService) {}

  // ================= Create Fuel Session =================
  async createSession(dto: CreateFuelSessionDto, user: CurrentUserI) {
    if (user.role !== UserRole.REFUELING_TEAM) {
      throw new ForbiddenException('Only refuel team can create sessions');
    }

    const branch = await this.prisma.branch.findUnique({
      where: { id: dto.branchId },
    });
    if (!branch) throw new BadRequestException('Branch not found');

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
    });
    if (!vehicle) throw new BadRequestException('Vehicle not found');
    if (vehicle.branchId !== dto.branchId) {
      throw new BadRequestException('Vehicle does not belong to branch');
    }

    const driver = await this.prisma.user.findUnique({
      where: { id: dto.driverId },
    });
    if (!driver || driver.role !== UserRole.DRIVER) {
      throw new BadRequestException('Invalid driver');
    }

    return this.prisma.fuelSession.create({
      data: {
        branchId: dto.branchId,
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        erpTaskRef: dto.erpTaskRef,
        openedById: user.id,
        status: FuelSessionStatus.OPEN,
      },
    });
  }

  // ================= Record Initial State =================
  async recordInitialState(
    sessionId: string,
    dto: RecordInitialStateDto,
    user: CurrentUserI,
  ) {
    if (user.role !== UserRole.REFUELING_TEAM) {
      throw new ForbiddenException('Only refuel team can record initial state');
    }

    const session = await this.prisma.fuelSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== FuelSessionStatus.OPEN) {
      throw new ForbiddenException('Session is not open');
    }

    const existing = await this.prisma.fuelSessionInitialState.findUnique({
      where: { fuelSessionId: sessionId },
    });
    if (existing) {
      throw new BadRequestException('Initial state already recorded');
    }

    return this.prisma.fuelSessionInitialState.create({
      data: {
        fuelSessionId: sessionId,
        odometerStart: dto.odometer,
        fuelLevelStart: dto.fuelLevel,
        recordedById: user.id,
      },
    });
  }

  // ================= Create Metadata =================
async createMetadata(
  sessionId: string,
  dto: CreateMetadataDto,
  user: CurrentUserI,
) {
  if (user.role !== UserRole.REFUELING_TEAM) {
    throw new ForbiddenException('Only refuel team can record metadata');
  }

  const session = await this.prisma.fuelSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) throw new NotFoundException('Session not found');
  if (session.status !== FuelSessionStatus.OPEN) {
    throw new ForbiddenException('Session is not open');
  }

  const existing = await this.prisma.fuelSessionMetadata.findUnique({
    where: { fuelSessionId: sessionId },
  });
  if (existing) {
    throw new BadRequestException('Metadata already exists');
  }

  const timeOutDate = new Date(dto.timeOut);
  if (isNaN(timeOutDate.getTime())) {
    throw new BadRequestException('Invalid timeOut');
  }

  return this.prisma.fuelSessionMetadata.create({
    data: {
      fuelSessionId: sessionId,
      departure: dto.departure,
      destination: dto.destination,
      description: dto.description,
      department: dto.requestedDepartment,
      timeOut: timeOutDate,
      recordedById: user.id,
    },
  });
}

// ================= Update Metadata =================
async updateMetadata(
  sessionId: string,
  dto: UpdateMetadataDto,
  user: CurrentUserI,
) {
  if (user.role !== UserRole.REFUELING_TEAM) {
    throw new ForbiddenException('Only refuel team can update metadata');
  }

  const session = await this.prisma.fuelSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) throw new NotFoundException('Session not found');
  if (session.status !== FuelSessionStatus.OPEN) {
    throw new ForbiddenException('Session is not open');
  }

  const metadata = await this.prisma.fuelSessionMetadata.findUnique({
    where: { fuelSessionId: sessionId },
  });
  if (!metadata) {
    throw new BadRequestException('Metadata not yet created');
  }

  let timeOutDate: Date | undefined;
  if (dto.timeOut !== undefined) {
    timeOutDate = new Date(dto.timeOut);
    if (isNaN(timeOutDate.getTime())) {
      throw new BadRequestException('Invalid timeOut');
    }
  }

  return this.prisma.fuelSessionMetadata.update({
    where: { fuelSessionId: sessionId },
    data: {
      ...(dto.departure && { departure: dto.departure }),
      ...(dto.destination && { destination: dto.destination }),
      ...(dto.description && { description: dto.description }),
      ...(dto.requestedDepartment && {
        department: dto.requestedDepartment,
      }),
      ...(timeOutDate && { timeOut: timeOutDate }),
      updatedAt: new Date(),
    },
  });
}

  // ================= Get Fuel Session =================
async getSession(sessionId: string, user: CurrentUserI) {
  const session = await this.prisma.fuelSession.findUnique({
    where: { id: sessionId },
    include: {
      driver: true,
      vehicle: true,
      branch: true,
      fuelRequests: true,
      initialState: true,
      finalState: true,
      metadata: true,
      analysis: true,
      fraudCase: true,
    },
  });

  if (!session) {
    throw new NotFoundException('Session not found');
  }

  // ===== Role-based visibility =====
  if (
    user.role === UserRole.REFUELING_TEAM &&
    session.openedById !== user.id
  ) {
    throw new ForbiddenException('Cannot view other sessions');
  }

  if (
    user.role === UserRole.BRANCH_ADMIN &&
    (session.status !== FuelSessionStatus.CLOSED ||
      session.branchId !== user.branchId)
  ) {
    throw new ForbiddenException('Branch admin can view only closed sessions in own branch');
  }

  if (
    user.role === UserRole.HQ_ADMIN &&
    session.status !== FuelSessionStatus.CLOSED
  ) {
    throw new ForbiddenException('HQ admin can view only closed sessions');
  }

  if (
    user.role === UserRole.REFUELING_MANAGER &&
    session.branchId !== user.branchId
  ) {
    throw new ForbiddenException('Manager can view only own branch sessions');
  }

  return session;
}

  // ================= Submit Fuel Request =================
  async submitFuelRequest(
    sessionId: string,
    driver: CurrentUserI,
    amount: number,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const session = await this.prisma.fuelSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.driverId !== driver.id) {
      throw new ForbiddenException('Driver not part of this session');
    }
    if (session.status !== FuelSessionStatus.OPEN) {
      throw new ForbiddenException('Cannot request fuel in closed session');
    }

    return this.prisma.fuelRequest.create({
      data: {
        fuelSessionId: sessionId,
        requestedById: driver.id,
        requestedAmount: amount,
        status: FuelRequestStatus.PENDING,
      },
    });
  }

  // ================= Approve Fuel Request =================
  async approveFuelRequest(
    requestId: string,
    approvedAmount: number,
    comment: string,
    manager: CurrentUserI,
  ) {
    if (approvedAmount <= 0) {
      throw new BadRequestException('Approved amount must be positive');
    }

    if (manager.role !== UserRole.REFUELING_MANAGER) {
      throw new ForbiddenException('Only refuel manager can approve');
    }

    const request = await this.prisma.fuelRequest.findUnique({
      where: { id: requestId },
      include: { fuelSession: true },
    });
    if (!request) throw new NotFoundException('Fuel request not found');

    if (request.fuelSession.branchId !== manager.branchId) {
      throw new ForbiddenException('Cannot approve other branch requests');
    }

    return this.prisma.fuelRequest.update({
      where: { id: requestId },
      data: {
        approvedAmount,
        status: FuelRequestStatus.APPROVED,
        approvedById: manager.id,
        managerComment: comment,
      },
    });
  }

  // ================= Reject Fuel Request =================
  async rejectFuelRequest(
    requestId: string,
    comment: string,
    manager: CurrentUserI,
  ) {
    if (manager.role !== UserRole.REFUELING_MANAGER) {
      throw new ForbiddenException('Only refuel manager can reject');
    }

    const request = await this.prisma.fuelRequest.findUnique({
      where: { id: requestId },
      include: { fuelSession: true },
    });
    if (!request) throw new NotFoundException('Fuel request not found');

    if (request.fuelSession.branchId !== manager.branchId) {
      throw new ForbiddenException('Cannot reject other branch requests');
    }

    return this.prisma.fuelRequest.update({
      where: { id: requestId },
      data: {
        status: FuelRequestStatus.REJECTED,
        approvedById: manager.id,
        managerComment: comment,
      },
    });
  }

  // ================= Close Fuel Session =================
  async closeSession(sessionId: string, user: CurrentUserI) {
    if (user.role !== UserRole.REFUELING_TEAM) {
      throw new ForbiddenException('Only refuel team can close session');
    }

    const session = await this.prisma.fuelSession.findUnique({
      where: { id: sessionId },
      include: {
        vehicle: true,
        initialState: true,
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== FuelSessionStatus.OPEN) {
      throw new ForbiddenException('Session already closed');
    }
    if (!session.initialState) {
      throw new BadRequestException('Initial state missing');
    }

    const finalState = await this.prisma.fuelSessionFinalState.findUnique({
      where: { fuelSessionId: sessionId },
    });
    if (!finalState) {
      throw new BadRequestException('Final state not recorded');
    }

    const distance =
      finalState.odometerEnd - session.initialState.odometerStart;

    const expectedConsumption =
      distance * session.vehicle.standardConsumption;

    const actualConsumption =
      session.initialState.fuelLevelStart -
      finalState.fuelLevelEnd;

    const variance = actualConsumption - expectedConsumption;
    const flagged = Math.abs(variance) > expectedConsumption * 0.1;

    await this.prisma.fuelConsumptionAnalysis.create({
      data: {
        fuelSessionId: sessionId,
        distance,
        expectedConsumption,
        actualConsumption,
        variance,
        flagged,
        analyzedById: user.id,
      },
    });

    return this.prisma.fuelSession.update({
      where: { id: sessionId },
      data: {
        status: FuelSessionStatus.CLOSED,
        closedAt: new Date(),
      },
    });
  }
}
