import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoomsService, AllocateBedDto, TransferBedDto } from './rooms.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { UserRole } from '@calyvia/shared';

@ApiTags('09. Rooms & Beds Allocation')
@Controller('rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.FACILITY_ADMIN,
    UserRole.ADMISSIONS_FRONT_DESK,
    UserRole.NURSE,
    UserRole.DOCTOR_PSYCHIATRIST,
    UserRole.MEDICAL_DIRECTOR,
    UserRole.MANAGEMENT_EXECUTIVE,
  )
  @ApiOperation({ summary: 'Get visual occupancy board for all wards and beds' })
  async getRoomsAndBeds() {
    return this.roomsService.getRoomsAndBeds();
  }

  @Post('allocations')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FACILITY_ADMIN, UserRole.ADMISSIONS_FRONT_DESK, UserRole.NURSE)
  @AuditLog({ action: 'ALLOCATE_BED', resource: 'BED_ALLOCATION' })
  @ApiOperation({ summary: 'Assign available bed to an admitted patient' })
  async allocateBed(@Body() dto: AllocateBedDto) {
    return this.roomsService.allocateBed(dto);
  }

  @Post('transfers')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FACILITY_ADMIN, UserRole.NURSE, UserRole.MEDICAL_DIRECTOR)
  @AuditLog({ action: 'TRANSFER_BED', resource: 'BED_ALLOCATION' })
  @ApiOperation({ summary: 'Transfer patient between beds or wards (e.g. Detox to Inpatient)' })
  async transferBed(@Body() dto: TransferBedDto) {
    return this.roomsService.transferBed(dto);
  }
}
