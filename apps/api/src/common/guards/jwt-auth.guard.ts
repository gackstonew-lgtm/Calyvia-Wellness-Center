import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../database/prisma.service';
import * as https from 'https';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    // 1. First attempt default Passport JWT Strategy (fast path for NestJS internal tokens)
    try {
      const passportResult = await super.canActivate(context);
      if (passportResult && request.user) {
        return true;
      }
    } catch {
      // If passport strategy fails (e.g. Supabase ES256/RS256 token), fall through to Supabase token verification
    }

    // 2. Fallback: Verify Supabase Auth JWT directly via Supabase Auth API
    try {
      const supabaseUser = await this.verifySupabaseAuthToken(token);
      if (supabaseUser && supabaseUser.id) {
        // Resolve user record and staff profile from institutional database
        let userRecord: any = null;
        if (this.prisma && this.prisma.user) {
          userRecord = await this.prisma.user.findUnique({
            where: { id: supabaseUser.id },
            include: { staffProfile: true },
          });

          if (!userRecord && supabaseUser.email) {
            userRecord = await this.prisma.user.findUnique({
              where: { email: supabaseUser.email.toLowerCase() },
              include: { staffProfile: true },
            });
          }
        }

        if (userRecord) {
          if (
            !userRecord.isActive ||
            userRecord.approvalStatus === 'SUSPENDED' ||
            userRecord.approvalStatus === 'DEACTIVATED' ||
            userRecord.approvalStatus === 'REJECTED'
          ) {
            throw new UnauthorizedException('User account has been suspended or deactivated');
          }

          request.user = {
            id: userRecord.id,
            email: userRecord.email,
            role: userRecord.role,
            fullName: userRecord.fullName,
            mustChangePassword: !!userRecord.mustChangePassword,
            staffProfile: userRecord.staffProfile || null,
          };
          return true;
        }

        // User authenticated via Supabase but profile record not yet in local table: resolve from metadata
        const role =
          supabaseUser.app_metadata?.role ||
          supabaseUser.user_metadata?.role ||
          'STAFF';
        const fullName =
          supabaseUser.user_metadata?.fullName ||
          supabaseUser.user_metadata?.full_name ||
          supabaseUser.email ||
          'Staff Member';

        request.user = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          role,
          fullName,
          mustChangePassword: false,
          staffProfile: null,
        };
        return true;
      }
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      this.logger.warn(`Supabase token verification fallback error: ${err?.message || err}`);
    }

    throw new UnauthorizedException('Invalid or expired authentication credentials');
  }

  private verifySupabaseAuthToken(token: string): Promise<any> {
    return new Promise((resolve) => {
      const supabaseUrlStr = process.env.SUPABASE_URL || 'https://ylpmrplszdxtlmzzrfgz.supabase.co';
      const anonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_CvFaUrKnUvt567KGStZ5vw_lEuJZiUI';

      try {
        const url = new URL(supabaseUrlStr);
        const req = https.request(
          {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: '/auth/v1/user',
            method: 'GET',
            headers: {
              apikey: anonKey,
              Authorization: 'Bearer ' + token,
            },
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              if (res.statusCode === 200) {
                try {
                  resolve(JSON.parse(data));
                } catch {
                  resolve(null);
                }
              } else {
                resolve(null);
              }
            });
          },
        );
        req.on('error', () => resolve(null));
        req.end();
      } catch {
        resolve(null);
      }
    });
  }
}
