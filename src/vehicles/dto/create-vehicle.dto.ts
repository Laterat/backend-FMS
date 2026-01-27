import { IsString, IsNumber, Min, IsUUID } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  vehicleCode: string;

  @IsString()
  type: string;

  @IsNumber()
  @Min(1)
  capacityLiters: number;

  @IsNumber()
  @Min(0)
  standardConsumption: number; // liters/km

  @IsUUID()
  branchId: string;
}
