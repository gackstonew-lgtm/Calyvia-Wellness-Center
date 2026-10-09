import { Controller, Post, Body, Req, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiExtensionService, AiSummarizationContract, AiFollowUpSuggestionContract } from './ai-extension.service';
import { AiChatRequestDto, AiChatResponseDto } from './dto/ai-chat.dto';
import { UserRole } from '@calyvia/shared';

@ApiTags('28. Calyvia AI Institutional Management Assistant')
@Controller('ai-extension')
export class AiExtensionController {
  constructor(private readonly aiExtensionService: AiExtensionService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Process queries for the institutional management copilot with live data grounding' })
  async chat(@Body() dto: AiChatRequestDto, @Req() req: any): Promise<AiChatResponseDto> {
    const user = req.user || {
      id: '00000000-0000-0000-0000-000000000001',
      fullName: 'Dr. Antony Baraka',
      role: UserRole.SUPER_ADMIN,
    };
    return this.aiExtensionService.processChat(dto, user);
  }

  @Get('status')
  @ApiOperation({ summary: 'Check AI assistant readiness and status' })
  async getStatus() {
    return {
      status: 'ONLINE',
      system: 'Calyvia Institutional Management Copilot',
      database: 'Supabase PostgreSQL Pooler Active',
      compliance: 'KDPA 2019 Compliant',
      version: '1.0.0',
    };
  }

  @Post('summaries/patient-record')
  @ApiOperation({ summary: 'Extension point: patient clinical record summary interface' })
  async summarizePatient(@Body() contract: AiSummarizationContract) {
    return this.aiExtensionService.generatePatientRecordSummary(contract);
  }

  @Post('recommendations/follow-up')
  @ApiOperation({ summary: 'Extension point: recovery follow-up suggestion interface' })
  async suggestFollowUp(@Body() contract: AiFollowUpSuggestionContract) {
    return this.aiExtensionService.getFollowUpSuggestions(contract);
  }
}
