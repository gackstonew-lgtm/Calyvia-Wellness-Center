import { Module } from '@nestjs/common';
import { AftercareController } from './aftercare.controller';
import { AftercareService } from './aftercare.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [AftercareController],
  providers: [AftercareService, PrismaService],
  exports: [AftercareService],
})
export class AftercareModule {}
