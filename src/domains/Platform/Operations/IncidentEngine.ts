import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class IncidentEngine {
  /**
   * Declares a new system incident.
   */
  static async declareIncident(title: string, summary: string, affectedService: string, affectedEngine: string, severity: string) {
    console.error(`[IncidentEngine] Declaring ${severity} incident: ${title}`);
    
    return prisma.incident.create({
      data: {
        title,
        summary,
        affectedService,
        affectedEngine,
        severity,
        startedAt: new Date(),
        detectedAt: new Date(),
        status: 'OPEN'
      }
    });
  }

  /**
   * Resolves an active incident.
   */
  static async resolveIncident(incidentId: string, resolution: string, rootCause: string) {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) return null;

    const resolvedAt = new Date();
    const mttrMinutes = Math.floor((resolvedAt.getTime() - incident.detectedAt.getTime()) / 60000);

    return prisma.incident.update({
      where: { id: incidentId },
      data: {
        status: 'RESOLVED',
        resolvedAt,
        mttrMinutes,
        resolution,
        rootCause
      }
    });
  }
}
