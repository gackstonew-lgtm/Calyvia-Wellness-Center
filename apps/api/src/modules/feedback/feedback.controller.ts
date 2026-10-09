import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService, SubmitFeedbackDto } from './feedback.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@ApiTags('21. Feedback & Complaints')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('surveys')
  @AuditLog({ action: 'SUBMIT_FEEDBACK_SURVEY', resource: 'FEEDBACK' })
  @ApiOperation({ summary: 'Submit patient or family satisfaction feedback' })
  async submitFeedback(@Body() dto: SubmitFeedbackDto) {
    return this.feedbackService.submitFeedback(dto);
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve satisfaction scores and patient NPS metrics' })
  async getSummary() {
    return this.feedbackService.getFeedbackSummary();
  }
}
