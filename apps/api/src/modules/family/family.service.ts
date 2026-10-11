import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CreateFamilyContactDto {
  patientId: string;
  fullName: string;
  relationship: string;
  phone: string;
  alternativePhone?: string;
  email?: string;
  isPrimaryGuarantor?: boolean;
  consentToContact?: boolean;
  hasConsentToUpdate?: boolean;
  notes?: string;
}

export interface UpdateFamilyContactDto {
  fullName?: string;
  relationship?: string;
  phone?: string;
  alternativePhone?: string;
  email?: string;
  isPrimaryGuarantor?: boolean;
  consentToContact?: boolean;
  notes?: string;
}

@Injectable()
export class FamilyService {
  constructor(private prisma: PrismaService) {}

  async getAllContacts(search?: string, patientId?: string) {
    if (!this.prisma || !this.prisma.emergencyContact) {
      return [];
    }

    const where: Record<string, any> = {};
    if (patientId) {
      where.patientId = patientId;
    }

    const contacts = await this.prisma.emergencyContact.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: { patient: true },
      orderBy: { id: 'desc' },
    });

    if (!search || !search.trim()) {
      return contacts;
    }

    const q = search.trim().toLowerCase();
    return contacts.filter((c: any) => {
      const matchName = (c.fullName || '').toLowerCase().includes(q);
      const matchPhone = (c.phone || '').toLowerCase().includes(q);
      const matchRel = (c.relationship || '').toLowerCase().includes(q);
      const matchPatName = c.patient
        ? `${c.patient.firstName || ''} ${c.patient.lastName || ''}`.toLowerCase().includes(q)
        : false;
      const matchPatUpi = c.patient ? (c.patient.upi || c.patient.id || '').toLowerCase().includes(q) : false;
      return matchName || matchPhone || matchRel || matchPatName || matchPatUpi;
    });
  }

  async getPatientFamily(patientId: string) {
    if (!this.prisma || !this.prisma.emergencyContact) {
      return [];
    }

    return await this.prisma.emergencyContact.findMany({
      where: { patientId },
      include: { patient: true },
    });
  }

  async addContact(dto: CreateFamilyContactDto) {
    if (!dto.patientId || !dto.fullName || !dto.phone || !dto.relationship) {
      throw new BadRequestException('Patient ID, full name, phone number, and relationship are mandatory.');
    }

    if (this.prisma && this.prisma.patient) {
      const pat = await this.prisma.patient.findUnique({ where: { id: dto.patientId } });
      if (!pat) {
        throw new NotFoundException(`Patient record (${dto.patientId}) was not found.`);
      }
    }

    try {
      const newContact = await this.prisma.emergencyContact.create({
        data: {
          patientId: dto.patientId,
          fullName: dto.fullName.trim(),
          relationship: dto.relationship.trim(),
          phone: dto.phone.trim(),
          alternativePhone: dto.alternativePhone?.trim() || null,
          email: dto.email?.trim().toLowerCase() || null,
          isPrimaryGuarantor: Boolean(dto.isPrimaryGuarantor),
          consentToContact: dto.consentToContact ?? dto.hasConsentToUpdate ?? true,
          notes: dto.notes?.trim() || null,
        },
      });

      return newContact;
    } catch (err: any) {
      throw new BadRequestException(`Failed to persist family contact: ${err.message || 'Database error'}`);
    }
  }

  async updateContact(id: string, dto: UpdateFamilyContactDto) {
    const existing = await this.prisma.emergencyContact.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Family contact with ID ${id} not found.`);
    }

    const updateData: Record<string, any> = {};
    if (dto.fullName !== undefined) updateData.fullName = dto.fullName.trim();
    if (dto.relationship !== undefined) updateData.relationship = dto.relationship.trim();
    if (dto.phone !== undefined) updateData.phone = dto.phone.trim();
    if (dto.alternativePhone !== undefined) updateData.alternativePhone = dto.alternativePhone?.trim() || null;
    if (dto.email !== undefined) updateData.email = dto.email?.trim().toLowerCase() || null;
    if (dto.isPrimaryGuarantor !== undefined) updateData.isPrimaryGuarantor = Boolean(dto.isPrimaryGuarantor);
    if (dto.consentToContact !== undefined) updateData.consentToContact = Boolean(dto.consentToContact);
    if (dto.notes !== undefined) updateData.notes = dto.notes?.trim() || null;

    try {
      return await this.prisma.emergencyContact.update({
        where: { id },
        data: updateData,
      });
    } catch (err: any) {
      throw new BadRequestException(`Failed to update contact: ${err.message || 'Database error'}`);
    }
  }

  async deleteContact(id: string) {
    const existing = await this.prisma.emergencyContact.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Family contact with ID ${id} not found.`);
    }

    try {
      await this.prisma.emergencyContact.delete({ where: { id } });
      return { success: true, message: 'Family contact successfully deleted.', id };
    } catch (err: any) {
      throw new BadRequestException(`Failed to delete family contact: ${err.message || 'Database error'}`);
    }
  }
}
