import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFuelSessionDto {
  @IsString() @IsNotEmpty()
  branchId: string;

  @IsString() @IsNotEmpty()
  driverId: string;

  @IsString() @IsNotEmpty()
  vehicleId: string;

  @IsString() @IsNotEmpty()
  erpTaskRef: string;
}
