import { IsEmail, IsEnum, IsOptional, IsUUID, IsPhoneNumber } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  fullName: string;

  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsPhoneNumber('ET')  // accepts any valid phone number
  phoneNumber?: string;

  @IsOptional()
  employeeId?: string;
}
