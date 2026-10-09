import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { PrismaService } from '../../database/prisma.service';
import { CrmModule } from '../crm/crm.module';

@Module({
  imports: [CrmModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService, PrismaService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
