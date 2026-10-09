import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AUDIT_LOG_KEY, AuditLogOptions } from '../decorators/audit-log.decorator';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.getAllAndOverride<AuditLogOptions>(
      AUDIT_LOG_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ip = request.ip || request.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const resourceId = request.params?.id || request.body?.id || null;

    return next.handle().pipe(
      tap(async () => {
        try {
          if (this.prisma && this.prisma.auditLog) {
            await this.prisma.auditLog.create({
              data: {
                userId: user?.sub || user?.id || null,
                role: user?.role || 'ANONYMOUS',
                action: auditOptions.action,
                resource: auditOptions.resource,
                resourceId: resourceId ? String(resourceId) : null,
                ipAddress: String(ip),
                userAgent: String(userAgent),
              },
            });
          }
        } catch (err) {
          // Failure to write non-blocking audit log does not abort response
          console.warn('Audit trail logging warning:', err);
        }
      }),
    );
  }
}
