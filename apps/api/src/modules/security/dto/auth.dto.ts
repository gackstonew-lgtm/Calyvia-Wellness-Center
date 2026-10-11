import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@calyviawellness.co.ke' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'CalyviaSecure#2026' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class RequestAccessDto {
  @ApiProperty({ example: 'Dr. Jane Muthoni' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 'jane.muthoni@calyviawellness.co.ke' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '+254712345678' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'Clinical Operations' })
  @IsString()
  @IsNotEmpty()
  department!: string;

  @ApiProperty({ example: 'Staff Psychiatrist' })
  @IsString()
  @IsNotEmpty()
  jobTitle!: string;

  @ApiProperty({ example: 'NURSE', required: false })
  @IsOptional()
  @IsString()
  requestedRole?: string;

  @ApiProperty({ example: 'InitialTempPassword#2026', required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: 'Joining clinical rotation in detox ward' })
  @IsString()
  @IsNotEmpty()
  justification!: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'admin123' })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({ example: 'NewSecureAdminPassword#2026' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}

export class ApproveAccessDto {
  @ApiProperty({ example: 'NURSE', required: false })
  @IsOptional()
  @IsString()
  assignedRole?: string;

  @ApiProperty({ example: 'Verified with HR and professional board roster', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectAccessDto {
  @ApiProperty({ example: 'Institutional documentation incomplete' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'SUSPENDED', 'DEACTIVATED'] })
  @IsString()
  @IsNotEmpty()
  status!: string;

  @ApiProperty({ example: 'NURSE', required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ example: 'Administrative review completed', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
