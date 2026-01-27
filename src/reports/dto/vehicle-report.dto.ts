import { IsUUID } from 'class-validator';

export class VehicleReportDto {
  @IsUUID()
  vehicleId: string;
}
