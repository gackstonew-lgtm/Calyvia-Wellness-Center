import { Test, TestingModule } from '@nestjs/testing';
import { SecurityService } from './security.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { UserRole } from '@calyvia/shared';
import { UnauthorizedException } from '@nestjs/common';

describe('SecurityService (Authentication & Password Security)', () => {
  let service: SecurityService;
  let mockPrisma: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
      },
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('jwt-mock-token-sample'),
      signAsync: jest.fn().mockResolvedValue('jwt-mock-token-sample'),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<SecurityService>(SecurityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash and verify passwords using Argon2id', async () => {
    const rawPassword = 'ClinicalSecure#2026';
    const hash = await service.hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash).toContain('$argon2');

    const isValid = await service.verifyPassword(hash, rawPassword);
    expect(isValid).toBe(true);

    const isInvalid = await service.verifyPassword(hash, 'WrongPassword');
    expect(isInvalid).toBe(false);
  }, 15000);

  it('should authenticate bootstrap admin credentials when database is uninitialized', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = await service.login({
      email: 'admin@calyviawellness.co.ke',
      password: 'Calyvia#2026',
    });

    expect(res).toBeDefined();
    expect(res.user.role).toBe(UserRole.SUPER_ADMIN);
    expect(res.tokens.accessToken).toBe('jwt-mock-token-sample');
  });

  it('should reject invalid credentials with UnauthorizedException', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'unknown@calyviawellness.co.ke',
        password: 'BadPassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
