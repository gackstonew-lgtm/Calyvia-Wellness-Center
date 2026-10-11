import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CreatePrescriptionDto {
  patientId: string;
  doctorName: string;
  medicationId: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
}

export interface AdministerMedicationDto {
  prescriptionId: string;
  administeredBy: string;
  status: string; // GIVEN, REFUSED, WITHHELD
  notes?: string;
}

@Injectable()
export class PharmacyService {
  constructor(private prisma: PrismaService) {}

  async getMedications() {
    try {
      if (this.prisma && this.prisma.medication) {
        return await this.prisma.medication.findMany({
          orderBy: { brandName: 'asc' },
        });
      }
    } catch (err) {
      console.warn('Medications fetch error:', err);
    }
    return [];
  }

  async createPrescription(dto: CreatePrescriptionDto) {
    if (!dto.patientId || !dto.doctorName || !dto.medicationId) {
      throw new BadRequestException('Patient ID, doctor name, and medication ID are mandatory.');
    }

    try {
      if (this.prisma && this.prisma.prescription) {
        return await this.prisma.prescription.create({
          data: {
            patientId: dto.patientId,
            doctorName: dto.doctorName,
            status: 'ACTIVE',
            medicationId: dto.medicationId,
            dosage: dto.dosage,
            frequency: dto.frequency,
            durationDays: dto.durationDays,
            instructions: dto.instructions || null,
          },
        });
      }
      throw new Error('Database connection unavailable');
    } catch (err: any) {
      throw new BadRequestException(`Failed to create prescription: ${err.message || 'Database error'}`);
    }
  }

  async administerMedication(dto: AdministerMedicationDto) {
    if (!dto.prescriptionId || !dto.administeredBy || !dto.status) {
      throw new BadRequestException('Prescription ID, administered by, and status are mandatory.');
    }

    try {
      if (this.prisma && this.prisma.medicationAdministration) {
        return await this.prisma.medicationAdministration.create({
          data: {
            prescriptionId: dto.prescriptionId,
            administeredBy: dto.administeredBy,
            status: dto.status,
            notes: dto.notes || null,
          },
        });
      }
      throw new Error('Database connection unavailable');
    } catch (err: any) {
      throw new BadRequestException(`Failed to administer medication: ${err.message || 'Database error'}`);
    }
  }
}
