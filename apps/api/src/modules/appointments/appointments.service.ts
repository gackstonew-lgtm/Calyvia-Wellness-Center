import { Injectable } from '@nestjs/common';
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
    try {
      if (this.prisma && this.prisma.appointment) {
        return await this.prisma.appointment.create({
          data: {
            title: dto.title,
            patientId: dto.patientId || null,
            staffMemberName: dto.staffMemberName,
            appointmentType: dto.appointmentType,
            startTime: new Date(dto.startTime),
            endTime: new Date(dto.endTime),
            location: dto.location,
          },
        });
      }
    } catch (err) {
      console.error('Failed to create appointment:', err);
      throw err;
    }
    throw new Error('Database connection unavailable');
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
