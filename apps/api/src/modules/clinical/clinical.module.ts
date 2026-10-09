import { Module } from '@nestjs/common';
import { ClinicalController } from './clinical.controller';
import { ClinicalService } from './clinical.service';
import { PrismaService } from '../../database/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';

@Module({
  controllers: [ClinicalController],
  providers: [ClinicalService, PrismaService, CryptoService],
  exports: [ClinicalService],
})
export class ClinicalModule {}
