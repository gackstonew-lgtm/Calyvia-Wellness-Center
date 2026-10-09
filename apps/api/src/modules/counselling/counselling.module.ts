import { Module } from '@nestjs/common';
import { CounsellingController } from './counselling.controller';
import { CounsellingService } from './counselling.service';
import { PrismaService } from '../../database/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';

@Module({
  controllers: [CounsellingController],
  providers: [CounsellingService, PrismaService, CryptoService],
  exports: [CounsellingService],
})
export class CounsellingModule {}
