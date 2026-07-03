import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export interface AuditEventPayload {
  action: string;
  actorId: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
}

export class AuditEngine {
  static async logEvent(payload: AuditEventPayload): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          id: `audit-${randomUUID()}`,
          action: payload.action,
          userId: payload.actorId,
          resourceType: payload.resourceType,
          resourceId: payload.resourceId,
          ipAddress: payload.ipAddress || '0.0.0.0',
          newValue: payload.details,
        }
      });
    } catch (error) {
      console.error('[AuditEngine] Failed to log event:', error);
    }
  }
}
