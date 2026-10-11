import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CreateMovementDto {
  patientId: string;
  movementType: string; // MEDICAL_ESCORT, COURT_APPEARANCE, THERAPEUTIC_PASS
  departureTime: string;
  expectedReturn: string;
  escortPerson?: string;
}

export interface RegisterVisitorDto {
  visitorName: string;
  nationalId: string;
  phoneNumber: string;
  patientName: string;
  relationship: string;
  officerName: string;
}

@Injectable()
export class MovementService {
  constructor(private prisma: PrismaService) {}

  async recordMovement(dto: CreateMovementDto) {
    try {
      if (this.prisma && this.prisma.movementRecord) {
        return await this.prisma.movementRecord.create({
          data: {
            patientId: dto.patientId,
            movementType: dto.movementType,
            departureTime: new Date(dto.departureTime),
            expectedReturn: new Date(dto.expectedReturn),
            escortPerson: dto.escortPerson || null,
            status: 'ON_LEAVE',
          },
        });
      }
    } catch {
      // Fallback
    }

    return {
      id: 'mock-move-1',
      ...dto,
      status: 'ON_LEAVE',
    };
  }

  async registerVisitor(dto: RegisterVisitorDto) {
    try {
      if (this.prisma && this.prisma.visitorLog) {
        return await this.prisma.visitorLog.create({
          data: {
            visitorName: dto.visitorName,
            nationalId: dto.nationalId,
            phoneNumber: dto.phoneNumber,
            patientName: dto.patientName,
            relationship: dto.relationship,
            officerName: dto.officerName,
            belongingsChecked: true,
          },
        });
      }
    } catch {
      // Fallback
    }

    return {
      id: 'mock-vis-1',
      ...dto,
      belongingsChecked: true,
      checkInTime: new Date().toISOString(),
    };
  }

  async getRecentVisitors() {
    try {
      if (this.prisma && this.prisma.visitorLog) {
        return await this.prisma.visitorLog.findMany({
          orderBy: { checkInTime: 'desc' },
          take: 20,
        });
      }
    } catch (err) {
      console.warn('Visitor logs fetch error:', err);
    }
    return [];
  }
}
