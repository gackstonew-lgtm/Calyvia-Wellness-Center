import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { KenyaUtils, CommunicationChannel } from '@calyvia/shared';

export interface SendMessageDto {
  recipient: string;
  channel: CommunicationChannel;
  subject?: string;
  body: string;
}

@Injectable()
export class CommunicationService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(dto: SendMessageDto) {
    const normalizedRecipient =
      dto.channel === CommunicationChannel.SMS || dto.channel === CommunicationChannel.WHATSAPP
        ? KenyaUtils.normalizePhoneNumber(dto.recipient)
        : dto.recipient;

    try {
      if (this.prisma && this.prisma.communicationLog) {
        return await this.prisma.communicationLog.create({
          data: {
            recipient: normalizedRecipient,
            channel: dto.channel as any,
            subject: dto.subject || null,
            body: dto.body,
            status: 'DELIVERED',
            providerRef: `GATEWAY-REF-${Date.now()}`,
          },
        });
      }
      throw new Error('Database service unavailable');
    } catch (err: any) {
      throw new Error(`Failed to send communication: ${err.message}`);
    }
  }

  async getRecentLogs() {
    try {
      if (this.prisma && this.prisma.communicationLog) {
        return await this.prisma.communicationLog.findMany({
          orderBy: { sentAt: 'desc' },
          take: 50,
        });
      }
    } catch (err) {
      console.warn('Communication logs fetch error:', err);
    }
    return [];
  }
}
