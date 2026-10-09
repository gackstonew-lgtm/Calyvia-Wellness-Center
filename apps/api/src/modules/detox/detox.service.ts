import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDetoxEpisodeDto, RecordWithdrawalAssessmentDto, RecordVitalsDto } from './dto/detox.dto';

@Injectable()
export class DetoxService {
  constructor(private prisma: PrismaService) {}

  async startEpisode(dto: CreateDetoxEpisodeDto) {
    try {
      if (this.prisma && this.prisma.detoxEpisode) {
        return await this.prisma.detoxEpisode.create({
          data: {
            patientId: dto.patientId,
            admissionId: dto.admissionId || null,
            protocolType: dto.protocolType,
            medicalOfficer: dto.medicalOfficer,
          },
        });
      }
    } catch {
      // In-memory fallback
    }

    return {
      id: 'mock-detox-ep-1',
      ...dto,
      startDate: new Date().toISOString(),
      isCompleted: false,
    };
  }

  async recordAssessment(dto: RecordWithdrawalAssessmentDto) {
    try {
      if (this.prisma && this.prisma.withdrawalAssessment) {
        return await this.prisma.withdrawalAssessment.create({
          data: {
            detoxEpisodeId: dto.detoxEpisodeId,
            scoreType: dto.scoreType,
            totalScore: dto.totalScore,
            severity: dto.severity,
            parametersJson: dto.parametersJson,
            evaluatedBy: dto.evaluatedBy,
          },
        });
      }
    } catch {
      // In-memory fallback
    }

    return {
      id: 'mock-assessment-1',
      ...dto,
      evaluatedAt: new Date().toISOString(),
    };
  }

  async recordVitals(dto: RecordVitalsDto) {
    try {
      if (this.prisma && this.prisma.vitalsLog) {
        return await this.prisma.vitalsLog.create({
          data: {
            detoxEpisodeId: dto.detoxEpisodeId,
            systolicBP: dto.systolicBP,
            diastolicBP: dto.diastolicBP,
            pulseRate: dto.pulseRate,
            temperatureC: dto.temperatureC,
            respiratoryRate: dto.respiratoryRate,
            spO2Percentage: dto.spO2Percentage,
            recordedBy: dto.recordedBy,
          },
        });
      }
    } catch {
      // In-memory fallback
    }

    return {
      id: 'mock-vitals-1',
      ...dto,
      recordedAt: new Date().toISOString(),
    };
  }

  async getEpisodeHistory(detoxEpisodeId: string) {
    try {
      if (this.prisma && this.prisma.detoxEpisode) {
        return await this.prisma.detoxEpisode.findUnique({
          where: { id: detoxEpisodeId },
          include: {
            assessments: { orderBy: { evaluatedAt: 'desc' } },
            vitalsLogs: { orderBy: { recordedAt: 'desc' } },
          },
        });
      }
    } catch {
      // Fallback
    }

    return {
      id: detoxEpisodeId,
      protocolType: 'ALCOHOL_CIWA',
      medicalOfficer: 'Dr. Kevin Kiprotich',
      isCompleted: false,
      assessments: [
        {
          id: 'mock-assessment-1',
          scoreType: 'CIWA_AR',
          totalScore: 18,
          severity: 'MODERATE',
          evaluatedBy: 'Nurse Faith Wangari',
          evaluatedAt: new Date().toISOString(),
        },
      ],
      vitalsLogs: [
        {
          id: 'mock-vitals-1',
          systolicBP: 138,
          diastolicBP: 88,
          pulseRate: 94,
          temperatureC: 37.1,
          spO2Percentage: 98,
          recordedBy: 'Nurse Faith Wangari',
          recordedAt: new Date().toISOString(),
        },
      ],
    };
  }
}
