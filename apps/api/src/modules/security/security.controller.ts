import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SecurityService } from './security.service';
import { LoginDto, RefreshTokenDto, RequestAccessDto, ChangePasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Security & Authentication (Module 24)')
@Controller('auth')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Staff login using email & password' })
  @ApiResponse({ status: 200, description: 'JWT tokens and user profile returned' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.securityService.login(loginDto);
  }

  @Post('request-access')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit personnel access request for administrator authorization' })
  @ApiResponse({ status: 200, description: 'Access request queued for administrator review' })
  async requestAccess(@Body() dto: RequestAccessDto) {
    return this.securityService.requestAccess(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtain new access token using refresh token' })
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    return this.securityService.refreshToken(refreshDto.refreshToken);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password for authenticated staff or primary administrator' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.securityService.changePassword(user.id || user.sub, dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout staff and invalidate authentication session' })
  @ApiResponse({ status: 200, description: 'Session invalidated and logout recorded' })
  async logout(@CurrentUser() user: any) {
    return this.securityService.logout(user?.id || user?.sub);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve currently authenticated user profile and roles' })
  async getProfile(@CurrentUser() user: any) {
    return {
      authenticated: true,
      user,
    };
  }
}

