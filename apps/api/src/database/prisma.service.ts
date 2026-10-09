import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

/**
 * Compatibility alias: redirects legacy PrismaService references to SupabaseService
 * communicating directly with hosted Supabase PostgreSQL.
 */
@Injectable()
export class PrismaService extends SupabaseService {}
