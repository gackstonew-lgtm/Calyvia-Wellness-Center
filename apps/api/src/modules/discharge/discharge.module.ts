import { Module } from '@nestjs/common';
import { DischargeController } from './discharge.controller';
import { DischargeService } from './discharge.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [DischargeController],
  providers: [DischargeService, PrismaService],
  exports: [DischargeService],
})
export class DischargeModule {}
