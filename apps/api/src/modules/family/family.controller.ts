import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FamilyService, CreateFamilyContactDto } from './family.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@ApiTags('18. Family Management')
@Controller('family')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post('contacts')
  @AuditLog({ action: 'CREATE_FAMILY_CONTACT', resource: 'FAMILY' })
  @ApiOperation({ summary: 'Register family contact or financial guarantor' })
  async addContact(@Body() dto: CreateFamilyContactDto) {
    return this.familyService.addContact(dto);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'List family members and guardians for a patient' })
  async getFamily(@Param('patientId') patientId: string) {
    return this.familyService.getPatientFamily(patientId);
  }
}
