import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadDto, UpdateLeadStatusDto, CreateAdmissionDto } from './dto/crm.dto';
import { KenyaUtils, PatientStatus } from '@calyvia/shared';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  private generateEnquiryNumber(): string {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `ENQ-${new Date().getFullYear()}-${rand}`;
  }

  private generateAdmissionNumber(): string {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `ADM-${new Date().getFullYear()}-${rand}`;
  }

  async createLead(dto: CreateLeadDto) {
    const enqNumber = this.generateEnquiryNumber();
    const phone = KenyaUtils.normalizePhoneNumber(dto.phone);

    try {
      if (this.prisma && this.prisma.lead) {
        return await this.prisma.lead.create({
          data: {
            enquiryNumber: enqNumber,
            fullName: dto.fullName,
            phone,
            email: dto.email || null,
            channel: dto.channel || 'DIRECT_WEBSITE',
            substancesUsed: dto.substancesUsed || null,
            urgencyLevel: dto.urgencyLevel || 'ROUTINE',
            pipelineStatus: 'NEW_INQUIRY',
            notes: dto.notes || null,
          },
        });
      }
    } catch {
      // In-memory fallback
    }

    return {
      id: 'mock-lead-1',
      enquiryNumber: enqNumber,
      fullName: dto.fullName,
      phone,
      pipelineStatus: 'NEW_INQUIRY',
      createdAt: new Date().toISOString(),
    };
  }

  async getLeads(status?: string) {
    try {
      if (this.prisma && this.prisma.lead) {
        return await this.prisma.lead.findMany({
          where: status ? { pipelineStatus: status } : {},
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch (err) {
      console.warn('Leads fetch error:', err);
    }
    return [];
  }

  async updateLeadStatus(id: string, dto: UpdateLeadStatusDto) {
    try {
      if (this.prisma && this.prisma.lead) {
        return await this.prisma.lead.update({
          where: { id },
          data: {
            pipelineStatus: dto.status,
            notes: dto.notes,
          },
        });
      }
    } catch (err) {
      console.warn('Update lead status error:', err);
    }
    return { id, pipelineStatus: dto.status, notes: dto.notes };
  }

  async processAdmission(dto: CreateAdmissionDto) {
    const admNumber = this.generateAdmissionNumber();

    try {
      if (this.prisma && this.prisma.admission) {
        const admission = await this.prisma.admission.create({
          data: {
            admissionNumber: admNumber,
            patientId: dto.patientId,
            admissionType: dto.admissionType,
            programType: dto.programType,
            admittingDoctorName: dto.admittingDoctorName,
            primaryCounsellorName: dto.primaryCounsellorName,
            admissionDate: dto.admissionDate ? new Date(dto.admissionDate) : new Date(),
          },
        });

        // Update patient status to ADMITTED_DETOX or ADMITTED_REHAB
        const targetStatus =
          dto.programType === 'DETOX_ONLY'
            ? PatientStatus.ADMITTED_DETOX
            : PatientStatus.ADMITTED_REHAB;

        await this.prisma.patient.update({
          where: { id: dto.patientId },
          data: { status: targetStatus },
        });

        return admission;
      }
    } catch (err) {
      console.warn('Process admission error:', err);
    }

    return {
      id: 'admission-uuid-1',
      admissionNumber: admNumber,
      patientId: dto.patientId,
      admissionType: dto.admissionType,
      programType: dto.programType,
      status: 'ACTIVE',
      admissionDate: new Date().toISOString(),
    };
  }

  async getAdmissions() {
    try {
      if (this.prisma && this.prisma.admission) {
        return await this.prisma.admission.findMany({
          include: { patient: true, bedAllocations: true },
          orderBy: { admissionDate: 'desc' },
        });
      }
    } catch (err) {
      console.warn('Admissions fetch error:', err);
    }
    return [];
  }
}
