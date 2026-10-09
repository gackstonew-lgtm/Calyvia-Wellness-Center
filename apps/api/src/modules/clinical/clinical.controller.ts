import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClinicalService } from './clinical.service';
import { CreateClinicalNoteDto } from './dto/clinical.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { UserRole } from '@calyvia/shared';

@ApiTags('03. Medical & Clinical Records')
@Controller('clinical')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClinicalController {
  constructor(private readonly clinicalService: ClinicalService) {}

  @Post('notes')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR_PSYCHIATRIST,
    UserRole.NURSE,
    UserRole.COUNSELLOR,
  )
  @AuditLog({ action: 'CREATE_CLINICAL_NOTE', resource: 'CLINICAL_NOTE' })
  @ApiOperation({ summary: 'Append versioned medical, psychiatric or nursing clinical note' })
  async createNote(@CurrentUser('id') authorId: string, @Body() dto: CreateClinicalNoteDto) {
    return this.clinicalService.createNote(authorId || '00000000-0000-0000-0000-000000000001', dto);
  }

  @Get('notes/patient/:patientId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.DOCTOR_PSYCHIATRIST,
    UserRole.NURSE,
    UserRole.COUNSELLOR,
    UserRole.MANAGEMENT_EXECUTIVE,
  )
  @AuditLog({ action: 'VIEW_CLINICAL_NOTES', resource: 'CLINICAL_NOTE' })
  @ApiOperation({ summary: 'View chronological decrypted clinical notes for a patient' })
  async getNotes(@Param('patientId') patientId: string) {
    return this.clinicalService.getPatientNotes(patientId);
  }
}
