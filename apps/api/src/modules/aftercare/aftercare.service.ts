import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface RecordCheckinDto {
  aftercarePlanId: string;
  cadenceDay: number; // 7, 14, 30, 60, 90
  contactMethod: string; // PHONE_CALL, WHATSAPP, IN_PERSON
  sobrietyStatus: string; // SOBER, RELAPSED, STRUGGLING
  notes: string;
}

@Injectable()
export class AftercareService {
  constructor(private prisma: PrismaService) {}

  async recordCheckin(dto: RecordCheckinDto) {
    try {
      if (this.prisma && this.prisma.aftercareCheckin) {
        return await this.prisma.aftercareCheckin.create({
          data: {
            aftercarePlanId: dto.aftercarePlanId,
            cadenceDay: dto.cadenceDay,
            contactMethod: dto.contactMethod,
            sobrietyStatus: dto.sobrietyStatus,
            notes: dto.notes,
          },
        });
      }
      throw new Error('Database service unavailable');
    } catch (err: any) {
      throw new Error(`Failed to record checkin: ${err.message}`);
    }
  }

  async getActivePlans() {
    try {
      if (this.prisma && this.prisma.aftercarePlan) {
        return await this.prisma.aftercarePlan.findMany({
          include: { patient: true, checkins: true },
          orderBy: { planStartDate: 'desc' },
        });
      }
    } catch (err) {
      console.warn('Aftercare plans fetch error:', err);
    }
    return [];
  }
}
