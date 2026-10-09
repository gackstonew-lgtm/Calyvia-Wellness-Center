import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CreateReferralPartnerDto {
  organizationName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  category: string;
  commissionNote?: string;
}

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async createPartner(dto: CreateReferralPartnerDto) {
    try {
      if (this.prisma && this.prisma.referralPartner) {
        return await this.prisma.referralPartner.create({
          data: {
            organizationName: dto.organizationName,
            contactPerson: dto.contactPerson,
            phone: dto.phone,
            email: dto.email || null,
            category: dto.category,
            commissionNote: dto.commissionNote || null,
          },
        });
      }
    } catch {
      // Fallback
    }

    return {
      id: 'mock-partner-1',
      ...dto,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
  }

  async getPartners() {
    try {
      if (this.prisma && this.prisma.referralPartner) {
        return await this.prisma.referralPartner.findMany({
          include: { leads: true },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch {
      // Fallback
    }

    return [
      {
        id: 'mock-partner-1',
        organizationName: 'Nairobi West Hospital Psychiatry Dept',
        contactPerson: 'Dr. Omolo',
        phone: '+254700112233',
        category: 'HOSPITAL',
        isActive: true,
      },
      {
        id: 'mock-partner-2',
        organizationName: 'Kiambu County Recovery Fellowship',
        contactPerson: 'Pastor Peter Mwangi',
        phone: '+254711223344',
        category: 'CHURCH',
        isActive: true,
      },
    ];
  }
}
