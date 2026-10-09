import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';

@ApiTags('26. Integrations (Daraja M-Pesa & Webhooks)')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('mpesa/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Safaricom Daraja Lipa Na M-Pesa Online async callback handler' })
  @ApiResponse({ status: 200, description: 'Callback received and transaction recorded' })
  async mpesaCallback(@Body() payload: any) {
    return this.integrationsService.handleMpesaCallback(payload);
  }

  @Post('webhook/website-lead')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Public webhook receiving enquiries from calyviawellness.co.ke' })
  async websiteLeadWebhook(@Body() leadPayload: any) {
    return this.integrationsService.handleWebsiteEnquiry(leadPayload);
  }
}
