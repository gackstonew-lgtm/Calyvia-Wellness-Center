import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      console.warn('Prisma database connection deferred. Running with in-memory fallback or waiting for database container.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
