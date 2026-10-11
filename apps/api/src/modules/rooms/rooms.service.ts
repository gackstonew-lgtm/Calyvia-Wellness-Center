import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BedStatus } from '@calyvia/shared';

export interface AllocateBedDto {
  bedId: string;
  patientId?: string;
  admissionId: string;
}

export interface TransferBedDto {
  currentAllocationId: string;
  newBedId: string;
  transferReason: string;
}

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async getRoomsAndBeds() {
    try {
      if (this.prisma && this.prisma.room) {
        return await this.prisma.room.findMany({
          include: {
            beds: true,
          },
        });
      }
    } catch (err) {
      console.warn('Rooms and beds fetch error:', err);
    }
    return [];
  }

  async allocateBed(dto: AllocateBedDto) {
    if (!dto.bedId || !dto.admissionId) {
      throw new BadRequestException('Bed ID and admission episode ID are required.');
    }

    try {
      if (this.prisma && this.prisma.bedAllocation) {
        return await this.prisma.$transaction(async (tx) => {
          const allocation = await tx.bedAllocation.create({
            data: {
              bedId: dto.bedId,
              patientId: dto.patientId || null,
              admissionId: dto.admissionId,
              isActive: true,
            },
          });

          await tx.bed.update({
            where: { id: dto.bedId },
            data: { status: BedStatus.OCCUPIED as any },
          });

          return allocation;
        });
      }
      throw new Error('Database connection unavailable');
    } catch (err: any) {
      throw new BadRequestException(`Failed to allocate bed: ${err.message || 'Database error'}`);
    }
  }

  async transferBed(dto: TransferBedDto) {
    if (!dto.currentAllocationId || !dto.newBedId) {
      throw new BadRequestException('Current allocation ID and target bed ID are required.');
    }

    try {
      if (this.prisma && this.prisma.bedAllocation) {
        return await this.prisma.$transaction(async (tx) => {
          const oldAlloc = await tx.bedAllocation.findUnique({
            where: { id: dto.currentAllocationId },
          });

          if (!oldAlloc) {
            throw new NotFoundException(`Allocation ${dto.currentAllocationId} not found.`);
          }

          await tx.bedAllocation.update({
            where: { id: dto.currentAllocationId },
            data: {
              isActive: false,
              endDate: new Date(),
              transferReason: dto.transferReason,
            },
          });

          await tx.bed.update({
            where: { id: oldAlloc.bedId },
            data: { status: BedStatus.AVAILABLE as any },
          });

          const newAlloc = await tx.bedAllocation.create({
            data: {
              bedId: dto.newBedId,
              patientId: oldAlloc.patientId,
              admissionId: oldAlloc.admissionId,
              isActive: true,
            },
          });

          await tx.bed.update({
            where: { id: dto.newBedId },
            data: { status: BedStatus.OCCUPIED as any },
          });

          return newAlloc;
        });
      }
      throw new Error('Database connection unavailable');
    } catch (err: any) {
      throw new BadRequestException(`Failed to transfer bed: ${err.message || 'Database error'}`);
    }
  }
}
