import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async getStaffDirectory() {
    try {
      if (this.prisma && this.prisma.user) {
        return await this.prisma.user.findMany({
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            phone: true,
            isActive: true,
            staffProfile: {
              select: {
                department: true,
                jobTitle: true,
                licenseNumber: true,
                licenseBoard: true,
                licenseExpiryDate: true,
              },
            },
          },
        });
      }
    } catch (err) {
      console.warn('Staff directory fetch error:', err);
    }
    return [];
  }

  async getExpiringLicences() {
    try {
      if (this.prisma && this.prisma.staffProfile) {
        const profiles = await this.prisma.staffProfile.findMany();
        const now = new Date();
        const ninetyDaysOut = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

        return profiles
          .filter((p: any) => p.licenseExpiryDate)
          .map((p: any) => {
            const exp = new Date(p.licenseExpiryDate);
            const daysRemaining = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return {
              staffName: p.jobTitle || 'Clinical Staff',
              licenceNumber: p.licenseNumber || '—',
              board: p.licenseBoard || 'Regulatory Board',
              expiryDate: p.licenseExpiryDate,
              daysRemaining,
              status: exp < now ? 'EXPIRED' : exp <= ninetyDaysOut ? 'EXPIRING_SOON' : 'VALID',
            };
          });
      }
    } catch (err) {
      console.warn('Staff licence audit fetch error:', err);
    }
    return [];
  }
}
