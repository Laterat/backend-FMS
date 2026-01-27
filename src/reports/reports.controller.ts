import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // 🔹 Branch report
  @Get('branch')
  branchReport(@Query('branchId') branchId: string) {
    return this.reportsService.branchFuelSummary(branchId);
  }

  // 🔹 Vehicle report
  @Get('vehicle')
  vehicleReport(@Query('vehicleId') vehicleId: string) {
    return this.reportsService.vehicleConsumption(vehicleId);
  }

  // 🔹 Driver report
  @Get('driver')
  driverReport(@Query('driverId') driverId: string) {
    return this.reportsService.driverFuelUsage(driverId);
  }

  // 🔹 Finance summary
  @Get('finance')
  financeReport() {
    return this.reportsService.financeSummary();
  }

  // 🔹 Fraud report
  @Get('fraud')
  fraudReport() {
    return this.reportsService.flaggedSessions();
  }
}
