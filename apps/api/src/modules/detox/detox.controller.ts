import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DetoxService } from './detox.service';
import { CreateDetoxEpisodeDto, RecordWithdrawalAssessmentDto, RecordVitalsDto } from './dto/detox.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { UserRole } from '@calyvia/shared';

@ApiTags('04. Detox Management (CIWA-Ar, COWS & Vitals)')
@Controller('detox')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DetoxController {
  constructor(private readonly detoxService: DetoxService) {}

  @Post('episodes')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MEDICAL_DIRECTOR, UserRole.DOCTOR_PSYCHIATRIST)
  @AuditLog({ action: 'START_DETOX_EPISODE', resource: 'DETOX_EPISODE' })
  @ApiOperation({ summary: 'Initiate a medically guided detoxification episode' })
  async startEpisode(@Body() dto: CreateDetoxEpisodeDto) {
    return this.detoxService.startEpisode(dto);
  }

  @Post('assessments')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MEDICAL_DIRECTOR, UserRole.DOCTOR_PSYCHIATRIST, UserRole.NURSE)
  @AuditLog({ action: 'RECORD_WITHDRAWAL_ASSESSMENT', resource: 'WITHDRAWAL_ASSESSMENT' })
  @ApiOperation({ summary: 'Record CIWA-Ar or COWS withdrawal assessment score' })
  async recordAssessment(@Body() dto: RecordWithdrawalAssessmentDto) {
    return this.detoxService.recordAssessment(dto);
  }

  @Post('vitals')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MEDICAL_DIRECTOR, UserRole.DOCTOR_PSYCHIATRIST, UserRole.NURSE)
  @AuditLog({ action: 'RECORD_DETOX_VITALS', resource: 'VITALS_LOG' })
  @ApiOperation({ summary: 'Log vital signs (BP, Pulse, Temp, SpO2) for detox patient' })
  async recordVitals(@Body() dto: RecordVitalsDto) {
    return this.detoxService.recordVitals(dto);
  }

  @Get('episodes/:id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR_PSYCHIATRIST,
    UserRole.NURSE,
    UserRole.COUNSELLOR,
    UserRole.MANAGEMENT_EXECUTIVE,
  )
  @ApiOperation({ summary: 'Retrieve full detox withdrawal chart and vitals flow' })
  async getEpisodeHistory(@Param('id') id: string) {
    return this.detoxService.getEpisodeHistory(id);
  }
}
