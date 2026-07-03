import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuditEngine {
  /**
   * Logs a critical configuration or administrative change to the immutable ledger.
   */
  static async logAction(
    action: string, 
    resourceType: string, 
    resourceId: string, 
    oldValue: any, 
    newValue: any, 
    userId?: string, 
    tenantId?: string,
    ipAddress?: string
  ) {
    console.log(`[AuditEngine] Logging ${action} on ${resourceType}:${resourceId}`);
    
    // Note: This is an append-only operation. We never UPDATE or DELETE these records.
    return prisma.auditLog.create({
      data: {
        action,
        resourceType,
        resourceId,
        oldValue: oldValue || {},
        newValue: newValue || {},
        userId,
        tenantId,
        ipAddress
      }
    });
  }
}
