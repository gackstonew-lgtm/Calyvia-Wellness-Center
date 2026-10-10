import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import { SupabaseService } from '../../database/supabase.service';
import { LoginDto, RequestAccessDto, ChangePasswordDto } from './dto/auth.dto';
import { UserRole } from '@calyvia/shared';

@Injectable()
export class SecurityService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async verifyPassword(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Standard demo staff credentials check or database lookup
    let user = null;
    try {
      if (this.prisma && this.prisma.user) {
        user = await this.prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: { staffProfile: true },
        });
      }
    } catch (err) {
      console.warn('Database user lookup failed, falling back to bootstrap admin credentials');
    }

    const bootstrapEmail = (process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@calyviawellness.co.ke').toLowerCase();
    const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'Calyvia#2026';

    if (user) {
      let isValid = await this.verifyPassword(user.passwordHash, password);
      if (!isValid && SupabaseService.staticClient) {
        try {
          const { data: authData, error: authErr } = await SupabaseService.staticClient.auth.signInWithPassword({
            email: email.toLowerCase(),
            password,
          });
          if (!authErr && authData?.user) {
            isValid = true;
            const newHash = await this.hashPassword(password);
            this.prisma.user.update({
              where: { id: user.id },
              data: { passwordHash: newHash, updatedAt: new Date() },
            }).catch(() => {});
          }
        } catch {}
      }

      if (!isValid) {
        throw new UnauthorizedException('Invalid email or password');
      }
      if (!user.isActive) {
        throw new UnauthorizedException('User account has been deactivated. Please contact the administrator.');
      }
    } else {
      // User not yet in public.users: verify via Supabase Auth
      let authenticatedViaSupabase = false;
      if (SupabaseService.staticClient) {
        try {
          const { data: authData, error: authErr } = await SupabaseService.staticClient.auth.signInWithPassword({
            email: email.toLowerCase(),
            password,
          });
          if (!authErr && authData?.user) {
            authenticatedViaSupabase = true;
            const newHash = await this.hashPassword(password);
            const authRole = authData.user.user_metadata?.role || authData.user.app_metadata?.role || UserRole.SUPER_ADMIN;
            const authName = authData.user.user_metadata?.fullName || 'Dr. Antony Baraka (Medical Director & Administrator)';
            user = await this.prisma.user.create({
              data: {
                id: authData.user.id,
                email: email.toLowerCase(),
                passwordHash: newHash,
                role: authRole,
                fullName: authName,
                isActive: true,
                mustChangePassword: false,
              },
            });
          }
        } catch {}
      }

      if (!authenticatedViaSupabase) {
        // Fallback emergency bootstrap check
        if (email.toLowerCase() === bootstrapEmail && password === bootstrapPassword) {
          user = {
            id: '00000000-0000-0000-0000-000000000001',
            email: bootstrapEmail,
            fullName: 'Dr. Baraka (Medical Director & Admin)',
            role: UserRole.SUPER_ADMIN,
            isActive: true,
          };
        } else {
          throw new UnauthorizedException('Invalid email or password');
        }
      }
    }

    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'calyvia_jwt_access_super_secret_development_key_2026_xyz',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'calyvia_jwt_refresh_super_secret_development_key_2026_xyz',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        mustChangePassword: !!user.mustChangePassword,
      },
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: 900,
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET || 'calyvia_jwt_refresh_super_secret_development_key_2026_xyz',
      });

      const newAccessToken = this.jwtService.sign(
        {
          sub: payload.sub,
          email: payload.email,
          fullName: payload.fullName,
          role: payload.role,
        },
        {
          secret: process.env.JWT_ACCESS_SECRET || 'calyvia_jwt_access_super_secret_development_key_2026_xyz',
          expiresIn: '15m',
        },
      );

      return {
        accessToken: newAccessToken,
        tokenType: 'Bearer',
        expiresIn: 900,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async requestAccess(dto: RequestAccessDto) {
    try {
      if (this.prisma && (this.prisma as any).staffTask) {
        await (this.prisma as any).staffTask.create({
          data: {
            title: `Staff Access Request: ${dto.fullName} (${dto.department})`,
            description: `Email: ${dto.email}, Phone: ${dto.phone}, Title: ${dto.jobTitle}. Justification: ${dto.justification}`,
            priority: 'HIGH',
            status: 'PENDING',
          },
        });
      }
    } catch (err) {
      console.warn('Could not record access request into staff task queue:', err);
    }

    return {
      success: true,
      message: 'Access request submitted successfully. A Calyvia facility administrator will review your credentials and verify institutional authorization.',
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const { currentPassword, newPassword } = dto;

    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters in length.');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException('New password must be different from the current temporary password.');
    }

    let user = null;
    if (this.prisma && this.prisma.user) {
      user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
    }

    if (!user) {
      throw new UnauthorizedException('User account not found.');
    }

    const isValid = await this.verifyPassword(user.passwordHash, currentPassword);
    if (!isValid) {
      throw new UnauthorizedException('Current password does not match.');
    }

    const newHash = await this.hashPassword(newPassword);

    if (this.prisma && this.prisma.user) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash: newHash,
          mustChangePassword: false,
          updatedAt: new Date(),
        },
      });

      // Synchronize new password with Supabase Auth if accessible
      if (SupabaseService.staticClient) {
        try {
          await SupabaseService.staticClient.auth.admin.updateUserById(userId, {
            password: newPassword,
          });
        } catch (supabaseErr) {
          console.warn('Supabase Auth password sync notification:', (supabaseErr as any).message);
        }
      }

      // Record in immutable audit log
      if ((this.prisma as any).auditLog) {
        await (this.prisma as any).auditLog.create({
          data: {
            userId: user.id,
            role: user.role,
            action: 'USER_PASSWORD_CHANGE',
            entityName: 'users',
            entityId: user.id,
            newValues: { changedAt: new Date().toISOString() },
          },
        });
      }
    }

    return {
      success: true,
      message: 'Password changed successfully. Permanent administrative credentials activated.',
    };
  }

  async logout(userId: string) {
    if (userId) {
      // Invalidate Supabase Auth session if accessible
      if (SupabaseService.staticClient) {
        try {
          await SupabaseService.staticClient.auth.admin.signOut(userId);
        } catch (signOutErr) {
          // Graceful handling for non-Supabase-managed tokens
        }
      }

      // Record logout audit log
      try {
        if (this.prisma && (this.prisma as any).auditLog) {
          await (this.prisma as any).auditLog.create({
            data: {
              userId,
              role: 'AUTHENTICATED',
              action: 'USER_LOGOUT',
              entityName: 'users',
              entityId: userId,
              newValues: { loggedOutAt: new Date().toISOString() },
            },
          });
        }
      } catch (err) {
        console.warn('Could not record logout audit log:', err);
      }
    }

    return {
      success: true,
      message: 'Logged out successfully. Authentication session invalidated.',
    };
  }
}

