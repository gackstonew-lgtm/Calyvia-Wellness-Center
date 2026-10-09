import { Module } from '@nestjs/common';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [FamilyController],
  providers: [FamilyService, PrismaService],
  exports: [FamilyService],
})
export class FamilyModule {}
