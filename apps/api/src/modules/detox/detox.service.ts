import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CreateDetoxEpisodeDto {
  patientId: string;
  admissionId?: string;
  protocolType: string; // ALCOHOL_CIWA, OPIOID_COWS, BENZO_TAPER
  medicalOfficer: string;
}

export interface RecordWithdrawalAssessmentDto {
  detoxEpisodeId: string;
  scoreType: string; // CIWA_AR, COWS
  totalScore: number;
  severity: string; // MILD, MODERATE, SEVERE
  parametersJson: Record<string, any>;
  evaluatedBy: string;
}

export interface RecordVitalsDto {
  detoxEpisodeId: string;
  systolicBP: number;
  diastolicBP: number;
  pulseRate: number;
  temperatureC: number;
  respiratoryRate: number;
  spO2Percentage: number;
  recordedBy: string;
}

@Injectable()
export class DetoxService {
  constructor(private prisma: PrismaService) {}

  async createEpisode(dto: CreateDetoxEpisodeDto) {
    if (!dto.patientId || !dto.protocolType || !dto.medicalOfficer) {
      throw new BadRequestException('Patient ID, protocol type, and medical officer are required.');
    }

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
      throw new Error('Database connection unavailable');
    } catch (err: any) {
      throw new BadRequestException(`Failed to create detox episode: ${err.message || 'Database error'}`);
    }
  }

  async recordAssessment(dto: RecordWithdrawalAssessmentDto) {
    if (!dto.detoxEpisodeId || !dto.scoreType || dto.totalScore === undefined) {
      throw new BadRequestException('Detox episode ID, score type, and total score are required.');
    }

    try {
      if (this.prisma && this.prisma.withdrawalAssessment) {
        return await this.prisma.withdrawalAssessment.create({
          data: {
            detoxEpisodeId: dto.detoxEpisodeId,
            scoreType: dto.scoreType,
            totalScore: dto.totalScore,
            severity: dto.severity || 'MILD',
            parametersJson: dto.parametersJson || {},
            evaluatedBy: dto.evaluatedBy,
          },
        });
      }
      throw new Error('Database connection unavailable');
    } catch (err: any) {
      throw new BadRequestException(`Failed to record withdrawal assessment: ${err.message || 'Database error'}`);
    }
  }

  async recordVitals(dto: RecordVitalsDto) {
    if (!dto.detoxEpisodeId || !dto.systolicBP || !dto.diastolicBP) {
      throw new BadRequestException('Detox episode ID, systolic BP, and diastolic BP are required.');
    }

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
      throw new Error('Database connection unavailable');
    } catch (err: any) {
      throw new BadRequestException(`Failed to record vitals log: ${err.message || 'Database error'}`);
    }
  }

  async getEpisodeHistory(detoxEpisodeId: string) {
    try {
      if (this.prisma) {
        const [assessments, vitals] = await Promise.all([
          this.prisma.withdrawalAssessment?.findMany({
            where: { detoxEpisodeId },
            orderBy: { assessedAt: 'desc' },
          }) || [],
          this.prisma.vitalsLog?.findMany({
            where: { detoxEpisodeId },
            orderBy: { recordedAt: 'desc' },
          }) || [],
        ]);

        return { assessments, vitals };
      }
    } catch (err) {
      console.warn('Detox history fetch error:', err);
    }
    return { assessments: [], vitals: [] };
  }
}
