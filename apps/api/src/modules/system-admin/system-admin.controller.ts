import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SystemAdminService } from './system-admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { UserRole } from '@calyvia/shared';

@ApiTags('25. System Administration')
@Controller('system-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SystemAdminController {
  constructor(private readonly systemAdminService: SystemAdminService) {}

  @Get('facility-config')
  @ApiOperation({ summary: 'Get Calyvia facility master configuration and service tracks' })
  async getFacilityConfig() {
    return this.systemAdminService.getFacilityConfig();
  }

  @Post('settings')
  @Roles(UserRole.SUPER_ADMIN)
  @AuditLog({ action: 'UPDATE_SYSTEM_SETTING', resource: 'SYSTEM_SETTING' })
  @ApiOperation({ summary: 'Update facility system setting or operational parameter' })
  async updateSetting(@Body() body: { key: string; value: string; category: string }) {
    return this.systemAdminService.updateSetting(body.key, body.value, body.category);
  }
}
