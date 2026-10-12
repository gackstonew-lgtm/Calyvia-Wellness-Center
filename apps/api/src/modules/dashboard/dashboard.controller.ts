import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@calyvia/shared';

@ApiTags('22. Management Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.FACILITY_ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.MANAGEMENT_EXECUTIVE,
    UserRole.FINANCE_BILLING,
  )
  @ApiOperation({ summary: 'Retrieve comprehensive real-time facility KPIs and census' })
  async getDashboard() {
    return this.dashboardService.getExecutiveMetrics();
  }

  @Get('metrics')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.FACILITY_ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.MANAGEMENT_EXECUTIVE,
    UserRole.FINANCE_BILLING,
  )
  @ApiOperation({ summary: 'Retrieve comprehensive real-time facility KPIs and census' })
  async getMetrics() {
    return this.dashboardService.getExecutiveMetrics();
  }
}
