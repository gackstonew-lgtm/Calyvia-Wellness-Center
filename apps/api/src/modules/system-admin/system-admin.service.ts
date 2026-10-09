import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SystemAdminService {
  constructor(private prisma: PrismaService) {}

  async getFacilityConfig() {
    return {
      facilityName: 'Calyvia Wellness Center',
      tagline: 'Comprehensive Addiction Recovery & Mental Health Rehabilitation',
      location: 'Mugutha, Behind Full Gospel Church, Ruiru, Kiambu County, Kenya',
      gpsCoordinates: '-1.1193655, 36.9487542',
      primaryPhone: '+254700534306',
      officialEmail: 'calyviawellness@gmail.com',
      websiteUrl: 'https://calyviawellness.co.ke',
      servicesOffered: [
        'Comprehensive Clinical Assessment',
        'Medically Guided Detoxification',
        'Inpatient Rehabilitation (30 / 60 / 90 Days)',
        'Outpatient Rehabilitation',
        'Individual & Group Psychotherapy',
        'Family Therapy & Support',
        'Relapse Prevention & Aftercare Follow-up',
      ],
      compliance: {
        kdpa2019Compliant: true,
        dataControllerRegistered: true,
        auditTrailEnabled: true,
      },
    };
  }

  async updateSetting(key: string, value: string, category: string) {
    try {
      if (this.prisma && this.prisma.systemSetting) {
        return await this.prisma.systemSetting.upsert({
          where: { key },
          update: { value, category },
          create: { key, value, category },
        });
      }
    } catch {
      // Fallback
    }

    return { key, value, category, updatedAt: new Date().toISOString() };
  }
}
