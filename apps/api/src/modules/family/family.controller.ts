import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FamilyService, CreateFamilyContactDto, UpdateFamilyContactDto } from './family.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@ApiTags('18. Family Management')
@Controller('family')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Get()
  @ApiOperation({ summary: 'List all family contacts across patients with search and filtering' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for contact name, phone, or patient' })
  @ApiQuery({ name: 'patientId', required: false, description: 'Filter contacts for a specific patient' })
  async getContactsRoot(@Query('search') search?: string, @Query('patientId') patientId?: string) {
    return this.familyService.getAllContacts(search, patientId);
  }

  @Get('contacts')
  @ApiOperation({ summary: 'List all family contacts across patients' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'patientId', required: false })
  async getContacts(@Query('search') search?: string, @Query('patientId') patientId?: string) {
    return this.familyService.getAllContacts(search, patientId);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'List family members and guardians for a patient' })
  async getFamily(@Param('patientId') patientId: string) {
    return this.familyService.getPatientFamily(patientId);
  }

  @Post('contacts')
  @AuditLog({ action: 'CREATE_FAMILY_CONTACT', resource: 'FAMILY' })
  @ApiOperation({ summary: 'Register family contact or financial guarantor' })
  async addContact(@Body() dto: CreateFamilyContactDto) {
    return this.familyService.addContact(dto);
  }

  @Patch('contacts/:id')
  @AuditLog({ action: 'UPDATE_FAMILY_CONTACT', resource: 'FAMILY' })
  @ApiOperation({ summary: 'Update an existing family contact or consent details' })
  async updateContact(@Param('id') id: string, @Body() dto: UpdateFamilyContactDto) {
    return this.familyService.updateContact(id, dto);
  }

  @Delete('contacts/:id')
  @AuditLog({ action: 'DELETE_FAMILY_CONTACT', resource: 'FAMILY' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a family contact record' })
  async deleteContact(@Param('id') id: string) {
    return this.familyService.deleteContact(id);
  }
}
