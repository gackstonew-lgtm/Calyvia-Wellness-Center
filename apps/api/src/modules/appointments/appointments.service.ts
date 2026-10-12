import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CreateAppointmentDto {
  title: string;
  patientId?: string;
  staffMemberName: string;
  appointmentType: string;
  startTime: string;
  endTime: string;
  location: string;
}

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async createAppointment(dto: CreateAppointmentDto) {
    if (!dto.title?.trim() || !dto.appointmentType) {
      throw new BadRequestException('Appointment title and appointment type are required.');
    }

    const start = dto.startTime ? new Date(dto.startTime) : new Date();
    const end = dto.endTime ? new Date(dto.endTime) : new Date(start.getTime() + 60 * 60 * 1000);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid start or end timestamp supplied for appointment.');
    }

    try {
      if (this.prisma && this.prisma.appointment) {
        return await this.prisma.appointment.create({
          data: {
            title: dto.title.trim(),
            patientId: dto.patientId || null,
            staffMemberName: dto.staffMemberName || 'Attending Clinician',
            appointmentType: dto.appointmentType,
            startTime: start,
            endTime: end,
            location: dto.location || 'Consultation Suite A',
          },
        });
      }
    } catch (err: any) {
      console.error('Failed to create appointment:', err?.message || err);
      throw new BadRequestException(`Failed to schedule appointment: ${err?.message || 'Invalid payload'}`);
    }
    throw new BadRequestException('Database connection unavailable');
  }

  async getUpcomingAppointments() {
    try {
      if (this.prisma && this.prisma.appointment) {
        return await this.prisma.appointment.findMany({
          orderBy: { startTime: 'asc' },
        });
      }
    } catch (err) {
      console.warn('Appointments fetch error:', err);
    }
    return [];
  }
}
