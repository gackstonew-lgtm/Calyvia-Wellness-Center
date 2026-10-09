import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunicationService, SendMessageDto } from './communication.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@ApiTags('20. Communication (SMS & WhatsApp Hub)')
@Controller('communication')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Post('send')
  @AuditLog({ action: 'DISPATCH_COMMUNICATION', resource: 'COMMUNICATION' })
  @ApiOperation({ summary: 'Send transactional SMS, WhatsApp, or Email to patient/family' })
  async sendMessage(@Body() dto: SendMessageDto) {
    return this.communicationService.sendMessage(dto);
  }

  @Get('logs')
  @ApiOperation({ summary: 'View recent communication outbound logs and delivery receipts' })
  async getLogs() {
    return this.communicationService.getRecentLogs();
  }
}
