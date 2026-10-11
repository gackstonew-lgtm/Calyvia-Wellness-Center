import { Injectable, BadRequestException } from '@nestjs/common';
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
    if (!dto.description || !dto.category || !dto.severity) {
      throw new BadRequestException('Incident category, severity, and description are required.');
    }

    const incNumber = this.generateIncidentNumber();

    try {
      if (this.prisma && this.prisma.incidentReport) {
        return await this.prisma.incidentReport.create({
          data: {
            incidentNumber: incNumber,
            patientId: dto.patientId || null,
            severity: dto.severity as any,
            category: dto.category,
            description: dto.description.trim(),
            immediateAction: dto.immediateAction?.trim() || 'Immediate nursing & security evaluation',
            reportedBy: dto.reportedBy || 'Staff Member',
          },
        });
      }
      throw new Error('Database connection unavailable');
    } catch (err: any) {
      throw new BadRequestException(`Failed to report incident: ${err.message || 'Database error'}`);
    }
  }

  async getIncidents() {
    try {
      if (this.prisma && this.prisma.incidentReport) {
        return await this.prisma.incidentReport.findMany({
          orderBy: { incidentNumber: 'desc' },
        });
      }
    } catch (err) {
      console.warn('Incident reports fetch error:', err);
    }
    return [];
  }
}
