import { Prisma } from "@prisma/client";
import { prisma as defaultPrisma } from "../../../../lib/prisma";

export class OrderRepository {
  /**
   * Structurally enforces Gate 14 (Tenant Isolation).
   */
  static async findById(id: string, tenantId: string, tx?: Prisma.TransactionClient) {
    const client = tx || defaultPrisma;
    
    // Structurally enforce tenant boundary
    const order = await client.order.findFirst({
      where: { id, tenantId },
      include: { items: true }
    });

    return order;
  }

  /**
   * Atomically updates an order using optimistic concurrency.
   * Throws if the version does not match.
   */
  static async updateStatus(
    id: string, 
    tenantId: string,
    expectedVersion: number, 
    newStatus: string, 
    tx: Prisma.TransactionClient
  ) {
    // updateMany is used because Prisma does not support composite where predicates 
    // with non-unique fields (tenantId, version) in `update`.
    const result = await tx.order.updateMany({
      where: {
        id,
        tenantId,
        version: expectedVersion
      },
      data: {
        status: newStatus as any,
        version: { increment: 1 }
      }
    });

    if (result.count === 0) {
      throw new Error("ConcurrencyConflictException: Order update failed due to version mismatch or not found.");
    }

    return true;
  }

  static async createOrder(data: any, tx?: Prisma.TransactionClient) {
    const client = tx || defaultPrisma;
    return client.order.create({ data });
  }
}
