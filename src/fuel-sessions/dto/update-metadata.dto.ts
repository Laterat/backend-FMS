import { IsString, IsOptional } from 'class-validator';

export class UpdateMetadataDto {
  @IsString() @IsOptional()
  departure?: string;

  @IsString() @IsOptional()
  destination?: string;

  @IsString() @IsOptional()
  description?: string;

  @IsString() @IsOptional()
  requestedDepartment?: string;

  @IsString() @IsOptional()
  timeOut?: string;
}
