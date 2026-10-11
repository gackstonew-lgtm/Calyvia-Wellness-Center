import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
  providers: [
    SupabaseService,
    {
      provide: PrismaService,
      useExisting: SupabaseService,
    },
  ],
  exports: [PrismaService, SupabaseService],
})
export class PrismaModule {}
