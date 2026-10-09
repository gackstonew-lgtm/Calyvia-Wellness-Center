import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@calyvia/shared';

@ApiTags('12. Staff Management')
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.FACILITY_ADMIN, UserRole.MEDICAL_DIRECTOR, UserRole.MANAGEMENT_EXECUTIVE)
  @ApiOperation({ summary: 'List all clinical, administrative, and operations personnel' })
  async getStaff() {
    return this.staffService.getStaffDirectory();
  }

  @Get('licences/expiring')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FACILITY_ADMIN, UserRole.MEDICAL_DIRECTOR)
  @ApiOperation({ summary: 'Audit clinical staff professional licences approaching expiry' })
  async getExpiringLicences() {
    return this.staffService.getExpiringLicences();
  }
}
