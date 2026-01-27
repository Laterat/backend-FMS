import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMetadataDto {
  @IsString() @IsNotEmpty()
  departure: string;

  @IsString() @IsNotEmpty()
  destination: string;

  @IsString()
  description: string;

  @IsString() @IsNotEmpty()
  requestedDepartment: string;

  @IsString() @IsNotEmpty()
  timeOut: string;
}


