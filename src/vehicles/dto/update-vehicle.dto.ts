import { IsOptional, IsNumber, Min, IsString } from 'class-validator';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  capacityLiters?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  standardConsumption?: number;
}
