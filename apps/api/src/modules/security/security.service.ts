import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/auth.dto';
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

    // Default bootstrap admin if database is empty or initializing
    if (!user && email.toLowerCase() === 'admin@calyviawellness.co.ke' && password === 'Calyvia#2026') {
      user = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@calyviawellness.co.ke',
        fullName: 'Dr. Baraka (Medical Director & Admin)',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      };
    } else if (user) {
      const isValid = await this.verifyPassword(user.passwordHash, password);
      if (!isValid) {
        throw new UnauthorizedException('Invalid email or password');
      }
      if (!user.isActive) {
        throw new UnauthorizedException('User account has been deactivated');
      }
    } else {
      throw new UnauthorizedException('Invalid email or password');
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
}
