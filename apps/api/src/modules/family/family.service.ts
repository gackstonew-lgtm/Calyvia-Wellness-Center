import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CreateFamilyContactDto {
  patientId: string;
  fullName: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  isPrimaryGuarantor?: boolean;
  hasConsentToUpdate?: boolean;
}

@Injectable()
export class FamilyService {
  constructor(private prisma: PrismaService) {}

  async addContact(dto: CreateFamilyContactDto) {
    try {
      if (this.prisma && this.prisma.emergencyContact) {
        return await this.prisma.emergencyContact.create({
          data: {
            patientId: dto.patientId,
            fullName: dto.fullName,
            relationship: dto.relationship,
            phone: dto.phone,
            email: dto.email || null,
            address: dto.address || null,
            isPrimaryGuarantor: dto.isPrimaryGuarantor ?? false,
            hasConsentToUpdate: dto.hasConsentToUpdate ?? true,
          },
        });
      }
    } catch {
      // Fallback
    }

    return {
      id: 'mock-family-1',
      ...dto,
    };
  }

  async getPatientFamily(patientId: string) {
    try {
      if (this.prisma && this.prisma.emergencyContact) {
        return await this.prisma.emergencyContact.findMany({
          where: { patientId },
        });
      }
    } catch (err) {
      console.warn('Family contacts fetch error:', err);
    }
    return [];
  }
}
