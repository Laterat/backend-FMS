import { IsString, IsNumber, IsUUID } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  fuelRequestId: string;

  @IsNumber()
  amount: number;

  @IsString()
  paymentMethod: string;

  @IsString()
  reference: string;
}
