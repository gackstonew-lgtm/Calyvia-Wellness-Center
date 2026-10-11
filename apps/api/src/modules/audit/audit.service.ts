import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logAction(data: {
    userId?: string;
    role?: string;
    action: string;
    resource: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    diffJson?: any;
  }) {
    try {
      if (this.prisma && this.prisma.auditLog) {
        return await this.prisma.auditLog.create({
          data: {
            userId: data.userId || null,
            role: data.role || 'ANONYMOUS',
            action: data.action,
            resource: data.resource,
            resourceId: data.resourceId || null,
            ipAddress: data.ipAddress || '127.0.0.1',
            userAgent: data.userAgent || 'system',
            diffJson: data.diffJson || null,
          },
        });
      }
    } catch (err) {
      console.warn('Audit record insertion skipped:', err);
    }
    return null;
  }

  async getAuditLogs(query?: { resource?: string; action?: string; limit?: number }) {
    const limit = query?.limit || 50;
    try {
      if (this.prisma && this.prisma.auditLog) {
        return await this.prisma.auditLog.findMany({
          where: {
            ...(query?.resource ? { resource: query.resource } : {}),
            ...(query?.action ? { action: query.action } : {}),
          },
          orderBy: { timestamp: 'desc' },
          take: limit,
          include: {
            user: {
              select: { id: true, email: true, fullName: true, role: true },
            },
          },
        });
      }
    } catch (err) {
      console.warn('Audit logs fetch error:', err);
    }
    return [];
  }
}
