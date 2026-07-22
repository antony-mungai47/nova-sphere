import { prisma } from "@/lib/prisma";

export class OutboxRepository {
  static async appendEvent(eventType: string, payload: any, aggregateId?: string, tx?: any) {
    const db = tx || prisma;
    return db.outboxEvent.create({
      data: {
        eventType,
        payload,
        aggregateId,
        status: "PENDING"
      }
    });
  }

  static async getPendingEvents(limit: number = 50) {
    return prisma.outboxEvent.findMany({
      where: { status: "PENDING" },
      take: limit,
      orderBy: { createdAt: "asc" }
    });
  }

  static async markProcessed(id: string) {
    return prisma.outboxEvent.update({
      where: { id },
      data: { 
        status: "PROCESSED",
        processedAt: new Date()
      }
    });
  }

  static async markFailed(id: string, error: string) {
    return prisma.outboxEvent.update({
      where: { id },
      data: {
        status: "FAILED",
        lastError: error
      }
    });
  }
}
