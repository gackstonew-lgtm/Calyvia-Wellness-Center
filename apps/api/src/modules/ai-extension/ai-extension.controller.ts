import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiExtensionService, AiSummarizationContract, AiFollowUpSuggestionContract } from './ai-extension.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@calyvia/shared';

@ApiTags('28. Future AI Features (Extension Boundary)')
@Controller('ai-extension')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AiExtensionController {
  constructor(private readonly aiExtensionService: AiExtensionService) {}

  @Post('summaries/patient-record')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MEDICAL_DIRECTOR, UserRole.DOCTOR_PSYCHIATRIST)
  @ApiOperation({ summary: 'Extension point: patient clinical record summary interface' })
  async summarizePatient(@Body() contract: AiSummarizationContract) {
    return this.aiExtensionService.generatePatientRecordSummary(contract);
  }

  @Post('recommendations/follow-up')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MEDICAL_DIRECTOR, UserRole.COUNSELLOR)
  @ApiOperation({ summary: 'Extension point: recovery follow-up suggestion interface' })
  async suggestFollowUp(@Body() contract: AiFollowUpSuggestionContract) {
    return this.aiExtensionService.getFollowUpSuggestions(contract);
  }
}
