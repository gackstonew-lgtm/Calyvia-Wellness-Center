import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService, CreateAppointmentDto } from './appointments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@ApiTags('06. Appointments & Calendar')
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @AuditLog({ action: 'SCHEDULE_APPOINTMENT', resource: 'APPOINTMENT' })
  @ApiOperation({ summary: 'Schedule consultation, MDT review, or therapy appointment' })
  async create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all clinical sessions and appointments' })
  async getAll() {
    return this.appointmentsService.getUpcomingAppointments();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'List upcoming clinical sessions and calendar events' })
  async getUpcoming() {
    return this.appointmentsService.getUpcomingAppointments();
  }
}

