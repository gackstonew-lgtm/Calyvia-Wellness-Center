import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DischargeService, ProcessDischargeDto } from './discharge.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { UserRole } from '@calyvia/shared';

@ApiTags('16. Discharge Management')
@Controller('discharge')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DischargeController {
  constructor(private readonly dischargeService: DischargeService) {}

  @Post('process')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MEDICAL_DIRECTOR, UserRole.DOCTOR_PSYCHIATRIST)
  @AuditLog({ action: 'PROCESS_DISCHARGE', resource: 'DISCHARGE' })
  @ApiOperation({ summary: 'Complete multidisciplinary discharge summary & initiate aftercare' })
  async processDischarge(@Body() dto: ProcessDischargeDto) {
    return this.dischargeService.processDischarge(dto);
  }

  @Get('records')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.FACILITY_ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR_PSYCHIATRIST,
    UserRole.COUNSELLOR,
    UserRole.MANAGEMENT_EXECUTIVE,
  )
  @ApiOperation({ summary: 'List discharged patients with aftercare plan links' })
  async getDischarges() {
    return this.dischargeService.getDischarges();
  }
}
