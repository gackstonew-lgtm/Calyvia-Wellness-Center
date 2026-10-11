import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';

export interface CreateSessionDto {
  patientId?: string;
  admissionId?: string;
  counsellorName: string;
  sessionType: string; // INDIVIDUAL, GROUP, FAMILY, ADOLESCENT
  scheduledAt: string;
  durationMins?: number;
  goalsAddressed?: string;
  sessionNotes?: string;
}

@Injectable()
export class CounsellingService {
  constructor(
    private prisma: PrismaService,
    private crypto: CryptoService,
  ) {}

  async recordSession(dto: CreateSessionDto) {
    if (!dto.counsellorName || !dto.sessionType || !dto.scheduledAt) {
      throw new BadRequestException('Counsellor name, session type, and scheduled time are required.');
    }

    const sessionNotesEnc = dto.sessionNotes
      ? this.crypto.encrypt(dto.sessionNotes)
      : null;

    try {
      if (this.prisma && this.prisma.counsellingSession) {
        const session = await this.prisma.counsellingSession.create({
          data: {
            patientId: dto.patientId || null,
            admissionId: dto.admissionId || null,
            counsellorName: dto.counsellorName,
            sessionType: dto.sessionType,
            scheduledAt: new Date(dto.scheduledAt),
            durationMins: dto.durationMins || 60,
            goalsAddressed: dto.goalsAddressed || null,
            sessionNotesEnc,
            isAttended: true,
          },
        });
        return {
          ...session,
          sessionNotes: dto.sessionNotes,
          sessionNotesEnc: undefined,
        };
      }
      throw new Error('Database connection unavailable');
    } catch (err: any) {
      throw new BadRequestException(`Failed to record therapy session: ${err.message || 'Database error'}`);
    }
  }

  async getAllSessions(search?: string, sessionType?: string) {
    try {
      if (this.prisma && this.prisma.counsellingSession) {
        const where: Record<string, any> = {};
        if (sessionType && sessionType !== 'ALL') {
          where.sessionType = sessionType;
        }

        const sessions = await this.prisma.counsellingSession.findMany({
          where: Object.keys(where).length > 0 ? where : undefined,
          orderBy: { scheduledAt: 'desc' },
        });

        const decrypted = sessions.map((s: any) => ({
          ...s,
          sessionNotes: s.sessionNotesEnc ? this.crypto.decrypt(s.sessionNotesEnc) : (s.notesEncrypted ? this.crypto.decrypt(s.notesEncrypted) : null),
          sessionNotesEnc: undefined,
          notesEncrypted: undefined,
        }));

        if (!search || !search.trim()) {
          return decrypted;
        }

        const q = search.trim().toLowerCase();
        return decrypted.filter((s: any) => {
          const matchCounsellor = (s.counsellorName || '').toLowerCase().includes(q);
          const matchType = (s.sessionType || '').toLowerCase().includes(q);
          const matchGoals = (s.goalsAddressed || '').toLowerCase().includes(q);
          const matchNotes = (s.sessionNotes || '').toLowerCase().includes(q);
          return matchCounsellor || matchType || matchGoals || matchNotes;
        });
      }
    } catch (err) {
      console.warn('Counselling sessions fetch error:', err);
    }
    return [];
  }

  async getPatientSessions(patientId: string) {
    try {
      if (this.prisma && this.prisma.counsellingSession) {
        const sessions = await this.prisma.counsellingSession.findMany({
          where: { patientId },
          orderBy: { scheduledAt: 'desc' },
        });
        return sessions.map((s: any) => ({
          ...s,
          sessionNotes: s.sessionNotesEnc ? this.crypto.decrypt(s.sessionNotesEnc) : (s.notesEncrypted ? this.crypto.decrypt(s.notesEncrypted) : null),
          sessionNotesEnc: undefined,
          notesEncrypted: undefined,
        }));
      }
    } catch (err) {
      console.warn('Counselling sessions fetch error:', err);
    }
    return [];
  }
}
