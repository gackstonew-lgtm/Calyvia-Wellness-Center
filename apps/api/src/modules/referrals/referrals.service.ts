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
      throw new Error('Database service unavailable');
    } catch (err: any) {
      throw new Error(`Failed to create referral partner: ${err.message}`);
    }
  }

  async getPartners() {
    try {
      if (this.prisma && this.prisma.referralPartner) {
        return await this.prisma.referralPartner.findMany({
          include: { leads: true },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch (err) {
      console.warn('Referral partners fetch error:', err);
    }
    return [];
  }
}
