import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@calyvia/shared';

@ApiTags('23. Reports & Analytics')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('financial')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FINANCE_BILLING, UserRole.MANAGEMENT_EXECUTIVE)
  @ApiOperation({ summary: 'Generate detailed financial revenue and outstanding billing report' })
  async getFinancialReport(@Query('month') month?: string) {
    return this.reportsService.generateFinancialReport(month);
  }

  @Get('clinical-outcomes')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR_PSYCHIATRIST,
    UserRole.MANAGEMENT_EXECUTIVE,
  )
  @ApiOperation({ summary: 'Generate clinical detox and rehabilitation outcome metrics' })
  async getClinicalOutcomes() {
    return this.reportsService.generateClinicalOutcomesReport();
  }
}
