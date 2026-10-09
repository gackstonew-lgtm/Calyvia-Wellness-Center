import { Module } from '@nestjs/common';
import { DetoxController } from './detox.controller';
import { DetoxService } from './detox.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [DetoxController],
  providers: [DetoxService, PrismaService],
  exports: [DetoxService],
})
export class DetoxModule {}
