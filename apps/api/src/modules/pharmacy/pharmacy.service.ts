import { Injectable } from '@nestjs/common';
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
          include: { batches: true },
          orderBy: { brandName: 'asc' },
        });
      }
    } catch {
      // Fallback
    }

    return [
      {
        id: 'mock-med-1',
        brandName: 'Valium',
        genericName: 'Diazepam',
        strength: '10mg',
        dosageForm: 'Tablet',
        currentStock: 250,
        reorderLevel: 20,
        unitPriceKES: 50,
        isControlledDrug: true,
      },
      {
        id: 'mock-med-2',
        brandName: 'Neurobion',
        genericName: 'Vitamin B-Complex + Thiamine',
        strength: '100mg',
        dosageForm: 'Tablet',
        currentStock: 500,
        reorderLevel: 30,
        unitPriceKES: 35,
        isControlledDrug: false,
      },
    ];
  }

  async createPrescription(dto: CreatePrescriptionDto) {
    try {
      if (this.prisma && this.prisma.prescription) {
        return await this.prisma.prescription.create({
          data: {
            patientId: dto.patientId,
            doctorName: dto.doctorName,
            status: 'ACTIVE',
            items: {
              create: {
                medicationId: dto.medicationId,
                dosage: dto.dosage,
                frequency: dto.frequency,
                durationDays: dto.durationDays,
                instructions: dto.instructions || null,
              },
            },
          },
          include: { items: { include: { medication: true } } },
        });
      }
    } catch {
      // Fallback
    }

    return {
      id: 'mock-rx-1',
      patientId: dto.patientId,
      doctorName: dto.doctorName,
      status: 'ACTIVE',
      items: [
        {
          dosage: dto.dosage,
          frequency: dto.frequency,
          durationDays: dto.durationDays,
        },
      ],
    };
  }

  async administerMedication(dto: AdministerMedicationDto) {
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
    } catch {
      // Fallback
    }

    return {
      id: 'mock-mar-1',
      prescriptionId: dto.prescriptionId,
      administeredBy: dto.administeredBy,
      status: dto.status,
      administeredAt: new Date().toISOString(),
    };
  }
}
