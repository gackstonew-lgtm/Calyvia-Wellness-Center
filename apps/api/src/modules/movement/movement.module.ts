import { Module } from '@nestjs/common';
import { MovementController } from './movement.controller';
import { MovementService } from './movement.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [MovementController],
  providers: [MovementService, PrismaService],
  exports: [MovementService],
})
export class MovementModule {}
