import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { CurrentUserI } from '../auth/current-user.interface';

@Controller('finance')
export class FinanceController {
  constructor(private readonly service: FinanceService) {}

 @Post('transaction/:userId')
createTransaction(
  @Param('userId') userId: string,
  @Body() dto: CreateTransactionDto,
  @CurrentUser() user: CurrentUserI,
) {
  return this.service.processTransaction(dto, user.id);
}

  // REPORT
  @Get('reports/branch/:branchId')
  getBranchReport(@Param('branchId') branchId: string) {
    return this.service.branchFuelCostReport(branchId);
  }
}
