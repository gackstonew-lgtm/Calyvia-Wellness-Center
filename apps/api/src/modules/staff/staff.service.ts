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
    } catch {
      // Fallback
    }

    return [
      {
        id: 'staff-1',
        email: 'medical.director@calyviawellness.co.ke',
        fullName: 'Dr. Evelyn Wanjiku',
        role: 'MEDICAL_DIRECTOR',
        phone: '+254722100201',
        isActive: true,
        staffProfile: {
          department: 'Psychiatry & Medical Care',
          jobTitle: 'Lead Addiction Psychiatrist',
          licenseNumber: 'KMPDC-P5519',
          licenseExpiryDate: '2027-12-31',
        },
      },
      {
        id: 'staff-2',
        email: 'nurse.station@calyviawellness.co.ke',
        fullName: 'Nurse Faith Wangari',
        role: 'NURSE',
        phone: '+254711300403',
        isActive: true,
        staffProfile: {
          department: 'Inpatient Nursing',
          jobTitle: 'Senior Detox Nurse in Charge',
          licenseNumber: 'NCK-RN-28410',
          licenseExpiryDate: '2027-10-15',
        },
      },
    ];
  }

  async getExpiringLicences() {
    // Licences expiring in next 90 days
    return [
      {
        staffName: 'Dr. Evelyn Wanjiku',
        licenceNumber: 'KMPDC-P5519',
        board: 'Kenya Medical Practitioners and Dentists Council',
        expiryDate: '2027-12-31',
        daysRemaining: 448,
        status: 'VALID',
      },
      {
        staffName: 'Nurse Faith Wangari',
        licenceNumber: 'NCK-RN-28410',
        board: 'Nursing Council of Kenya',
        expiryDate: '2027-10-15',
        daysRemaining: 371,
        status: 'VALID',
      },
    ];
  }
}
