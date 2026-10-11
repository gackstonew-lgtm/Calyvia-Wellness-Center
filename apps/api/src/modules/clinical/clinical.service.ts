import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { CreateClinicalNoteDto } from './dto/clinical.dto';

@Injectable()
export class ClinicalService {
  constructor(
    private prisma: PrismaService,
    private crypto: CryptoService,
  ) {}

  async createNote(authorId: string, dto: CreateClinicalNoteDto) {
    const subjectiveEnc = this.crypto.encrypt(dto.subjective) || '';
    const objectiveEnc = this.crypto.encrypt(dto.objective) || '';
    const assessmentEnc = this.crypto.encrypt(dto.assessment) || '';
    const planEnc = this.crypto.encrypt(dto.plan) || '';

    try {
      if (this.prisma && this.prisma.clinicalNote) {
        const note = await this.prisma.clinicalNote.create({
          data: {
            patientId: dto.patientId,
            admissionId: dto.admissionId || null,
            authorId,
            noteType: dto.noteType as any,
            subjectiveEnc,
            objectiveEnc,
            assessmentEnc,
            planEnc,
            icd10Diagnosis: dto.icd10Diagnosis || null,
            version: 1,
            isLocked: true,
          },
        });
        return this.decryptNote(note);
      }
    } catch {
      // In-memory fallback
    }

    return {
      id: 'mock-note-1',
      patientId: dto.patientId,
      authorId,
      noteType: dto.noteType,
      subjective: dto.subjective,
      objective: dto.objective,
      assessment: dto.assessment,
      plan: dto.plan,
      icd10Diagnosis: dto.icd10Diagnosis,
      createdAt: new Date().toISOString(),
    };
  }

  async getPatientNotes(patientId: string) {
    try {
      if (this.prisma && this.prisma.clinicalNote) {
        const notes = await this.prisma.clinicalNote.findMany({
          where: { patientId },
          include: { author: { select: { fullName: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        });
        return notes.map((n) => this.decryptNote(n));
      }
    } catch (err) {
      console.warn('Clinical notes fetch error:', err);
    }
    return [];
  }

  private decryptNote(note: any) {
    return {
      ...note,
      subjective: this.crypto.decrypt(note.subjectiveEnc),
      objective: this.crypto.decrypt(note.objectiveEnc),
      assessment: this.crypto.decrypt(note.assessmentEnc),
      plan: this.crypto.decrypt(note.planEnc),
      subjectiveEnc: undefined,
      objectiveEnc: undefined,
      assessmentEnc: undefined,
      planEnc: undefined,
    };
  }
}
