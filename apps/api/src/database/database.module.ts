import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
  providers: [
    SupabaseService,
    {
      provide: 'PRISMA_SERVICE',
      useExisting: SupabaseService,
    },
  ],
  exports: [SupabaseService],
})
export class DatabaseModule {}
