import { IsInt, Min } from 'class-validator';

export class RecordInitialStateDto {
  @IsInt() @Min(0)
  odometer: number;

  @IsInt() @Min(0)
  fuelLevel: number; // in liters or %
}
