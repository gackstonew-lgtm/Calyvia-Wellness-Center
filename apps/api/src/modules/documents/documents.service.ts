import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CreateConsentDto {
  patientId: string;
  consentType: string;
  signatoryName: string;
  signatoryPhone?: string;
  signatureData?: string;
}

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async createConsent(dto: CreateConsentDto) {
    try {
      if (this.prisma && this.prisma.patientConsent) {
        return await this.prisma.patientConsent.create({
          data: {
            patientId: dto.patientId,
            consentType: dto.consentType,
            signatoryName: dto.signatoryName,
            signatoryPhone: dto.signatoryPhone || null,
            signatureData: dto.signatureData || null,
            isGranted: true,
          },
        });
      }
      throw new Error('Database service unavailable');
    } catch (err: any) {
      throw new Error(`Failed to create consent: ${err.message}`);
    }
  }

  async getConsents(patientId: string) {
    try {
      if (this.prisma && this.prisma.patientConsent) {
        return await this.prisma.patientConsent.findMany({
          where: { patientId },
        });
      }
    } catch (err) {
      console.warn('Patient consents fetch error:', err);
    }
    return [];
  }
}
