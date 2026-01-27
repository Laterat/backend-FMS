import { IsUUID } from 'class-validator';

export class BranchReportDto {
  @IsUUID()
  branchId: string;
}
