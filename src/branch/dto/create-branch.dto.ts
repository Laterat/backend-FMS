import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBranchDto {
  @IsNotEmpty()
  @IsString()
  region: string;

  
  @IsNotEmpty() @IsString() zone: string;
  @IsNotEmpty() @IsString() woreda: string;
  @IsNotEmpty() @IsString() kebele: string;
  @IsNotEmpty() @IsString() name: string;
  @IsNotEmpty() @IsString() code: string;
}
