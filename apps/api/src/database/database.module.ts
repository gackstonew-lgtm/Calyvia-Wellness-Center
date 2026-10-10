import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    SupabaseService,
    {
      provide: PrismaService,
      useExisting: SupabaseService,
    },
    {
      provide: 'PRISMA_SERVICE',
      useExisting: SupabaseService,
    },
  ],
  exports: [SupabaseService, PrismaService],
})
export class DatabaseModule {}
