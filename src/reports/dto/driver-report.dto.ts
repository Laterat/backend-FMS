import { IsUUID } from 'class-validator';

export class DriverReportDto {
  @IsUUID()
  driverId: string;
}
