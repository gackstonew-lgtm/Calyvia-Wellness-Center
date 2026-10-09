import { Module } from '@nestjs/common';
import { SystemAdminController } from './system-admin.controller';
import { SystemAdminService } from './system-admin.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [SystemAdminController],
  providers: [SystemAdminService, PrismaService],
  exports: [SystemAdminService],
})
export class SystemAdminModule {}
