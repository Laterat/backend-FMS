import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserI } from '../auth/current-user.interface';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  // GET vehicles (read-only for all roles)
  async getVehicles(user: CurrentUserI) {
    if (user.role === 'HQ_ADMIN') {
      return this.prisma.vehicle.findMany({ include: { branch: true } });
    }

    // Branch-level users see only their branch
    return this.prisma.vehicle.findMany({
      where: { branchId: user.branchId },
      include: { branch: true },
    });
  }

  // CREATE vehicle (only FUEL_ADMIN)
  async createVehicle(dto: CreateVehicleDto, user: CurrentUserI) {
    if (user.role !== 'FUEL_ADMIN') {
      throw new ForbiddenException('Only FUEL_ADMIN can create vehicles');
    }

    // Enforce branch restriction
    if (dto.branchId !== user.branchId) {
      throw new ForbiddenException('Cannot create vehicle in another branch');
    }

    return this.prisma.vehicle.create({ data: dto });
  }

  // UPDATE vehicle (only FUEL_ADMIN)
  async updateVehicle(id: string, dto: UpdateVehicleDto, user: CurrentUserI) {
    if (user.role !== 'FUEL_ADMIN') {
      throw new ForbiddenException('Only FUEL_ADMIN can update vehicles');
    }

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    if (vehicle.branchId !== user.branchId) {
      throw new ForbiddenException('Cannot update vehicle in another branch');
    }

    return this.prisma.vehicle.update({ where: { id }, data: dto });
  }
}
