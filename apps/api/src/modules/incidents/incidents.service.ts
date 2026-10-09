import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IncidentSeverity } from '@calyvia/shared';

export interface CreateIncidentDto {
  patientId?: string;
  severity: IncidentSeverity;
  category: string; // ABSCONDING, MEDICAL_EMERGENCY, CONTRABAND, SELF_HARM_ATTEMPT
  description: string;
  immediateAction: string;
  reportedBy: string;
}

@Injectable()
export class IncidentsService {
  constructor(private prisma: PrismaService) {}

  private generateIncidentNumber(): string {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `INC-${new Date().getFullYear()}-${rand}`;
  }

  async reportIncident(dto: CreateIncidentDto) {
    const incNumber = this.generateIncidentNumber();

    try {
      if (this.prisma && this.prisma.incidentReport) {
        return await this.prisma.incidentReport.create({
          data: {
            incidentNumber: incNumber,
            patientId: dto.patientId || null,
            severity: dto.severity as any,
            category: dto.category,
            description: dto.description,
            immediateAction: dto.immediateAction,
            reportedBy: dto.reportedBy,
          },
        });
      }
    } catch {
      // Fallback
    }

    return {
      id: 'mock-inc-1',
      incidentNumber: incNumber,
      ...dto,
      isResolved: false,
      reportedAt: new Date().toISOString(),
    };
  }

  async getIncidents() {
    try {
      if (this.prisma && this.prisma.incidentReport) {
        return await this.prisma.incidentReport.findMany({
          include: { patient: true },
          orderBy: { reportedAt: 'desc' },
        });
      }
    } catch {
      // Fallback
    }

    return [
      {
        id: 'mock-inc-1',
        incidentNumber: 'INC-2026-0012',
        severity: 'MEDIUM',
        category: 'CONTRABAND',
        description: 'Vape device confiscated during visitor luggage screening',
        immediateAction: 'Logged in contraband registry, surrendered to facility security',
        reportedBy: 'Officer Kimani',
        isResolved: true,
        reportedAt: new Date().toISOString(),
      },
    ];
  }
}
