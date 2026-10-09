import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('System')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Lightweight health check endpoint' })
  @ApiResponse({ status: 200, description: 'API service is operational' })
  getHealth() {
    return {
      status: 'ok',
      service: 'Calyvia Wellness Center API',
      timestamp: new Date().toISOString(),
    };
  }
}
