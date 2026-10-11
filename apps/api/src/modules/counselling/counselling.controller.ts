import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CounsellingService, CreateSessionDto } from './counselling.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { UserRole } from '@calyvia/shared';

@ApiTags('05. Counselling & Therapy')
@Controller('counselling')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CounsellingController {
  constructor(private readonly counsellingService: CounsellingService) {}

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.FACILITY_ADMIN,
    UserRole.COUNSELLOR,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR_PSYCHIATRIST,
    UserRole.MANAGEMENT_EXECUTIVE,
  )
  @ApiOperation({ summary: 'List all counselling and therapy sessions with filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sessionType', required: false })
  async getAllSessions(@Query('search') search?: string, @Query('sessionType') sessionType?: string) {
    return this.counsellingService.getAllSessions(search, sessionType);
  }

  @Get('sessions')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.FACILITY_ADMIN,
    UserRole.COUNSELLOR,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR_PSYCHIATRIST,
    UserRole.MANAGEMENT_EXECUTIVE,
  )
  @ApiOperation({ summary: 'List all counselling and therapy sessions' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sessionType', required: false })
  async getSessionsList(@Query('search') search?: string, @Query('sessionType') sessionType?: string) {
    return this.counsellingService.getAllSessions(search, sessionType);
  }

  @Post('sessions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FACILITY_ADMIN, UserRole.COUNSELLOR, UserRole.MEDICAL_DIRECTOR)
  @AuditLog({ action: 'RECORD_THERAPY_SESSION', resource: 'COUNSELLING_SESSION' })
  @ApiOperation({ summary: 'Log individual, group, or family therapy session note' })
  async recordSession(@Body() dto: CreateSessionDto) {
    return this.counsellingService.recordSession(dto);
  }

  @Get('patient/:patientId/sessions')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.FACILITY_ADMIN,
    UserRole.COUNSELLOR,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR_PSYCHIATRIST,
    UserRole.MANAGEMENT_EXECUTIVE,
  )
  @ApiOperation({ summary: 'View therapy history and treatment goal progression' })
  async getSessions(@Param('patientId') patientId: string) {
    return this.counsellingService.getPatientSessions(patientId);
  }
}
