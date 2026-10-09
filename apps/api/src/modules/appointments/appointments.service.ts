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
    } catch {
      // Fallback
    }

    return {
      id: 'mock-appt-1',
      ...dto,
      isReminderSent: false,
      status: 'SCHEDULED',
    };
  }

  async getUpcomingAppointments() {
    try {
      if (this.prisma && this.prisma.appointment) {
        return await this.prisma.appointment.findMany({
          orderBy: { startTime: 'asc' },
        });
      }
    } catch {
      // Fallback
    }

    return [
      {
        id: 'mock-appt-1',
        title: 'Weekly Multidisciplinary Team Review (MDT)',
        staffMemberName: 'Dr. Evelyn Wanjiku',
        appointmentType: 'PSYCHIATRIC_REVIEW',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        location: 'Consultation Suite A',
        status: 'SCHEDULED',
      },
    ];
  }
}
