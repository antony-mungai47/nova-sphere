import { Prisma } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/prisma";

export class InventoryRepository {
  /**
   * Retrieves the raw warehouse inventory state for a product.
   */
  static async getInventory(productId: string, tx?: Prisma.TransactionClient) {
    const client = tx || defaultPrisma;
    return client.inventory.findUnique({
      where: { productId }
    });
  }

  /**
   * Modifies the reserved counter in the warehouse inventory.
   */
  static async incrementReserved(inventoryId: string, quantity: number, tx: Prisma.TransactionClient) {
    return tx.inventory.update({
      where: { id: inventoryId },
      data: { reserved: { increment: quantity } }
    });
  }

  static async decrementReserved(inventoryId: string, quantity: number, tx: Prisma.TransactionClient) {
    return tx.inventory.update({
      where: { id: inventoryId },
      data: { reserved: { decrement: quantity } }
    });
  }

  static async commitReserved(inventoryId: string, quantity: number, tx: Prisma.TransactionClient) {
    return tx.inventory.update({
      where: { id: inventoryId },
      data: { 
        reserved: { decrement: quantity },
        quantity: { decrement: quantity } // Actually deduct from warehouse total
      }
    });
  }

  /**
   * Creates a reservation record.
   */
  static async createReservation(data: { inventoryId: string, orderId: string, quantity: number, status: string, expiresAt: Date }, tx: Prisma.TransactionClient) {
    return tx.reservation.create({
      data: {
        inventoryId: data.inventoryId,
        orderId: data.orderId,
        quantity: data.quantity,
        status: data.status,
        expiresAt: data.expiresAt
      }
    });
  }

  /**
   * Updates reservation status.
   */
  static async updateReservationStatus(orderId: string, status: string, tx: Prisma.TransactionClient) {
    return tx.reservation.updateMany({
      where: { orderId },
      data: { status }
    });
  }

  /**
   * Retrieves all reservations for an order.
   */
  static async getReservationsForOrder(orderId: string, tx?: Prisma.TransactionClient) {
    const client = tx || defaultPrisma;
    return client.reservation.findMany({
      where: { orderId },
      include: { inventory: true }
    });
  }

  /**
   * Finds expired pending reservations.
   */
  static async findExpiredReservations(now: Date, tx?: Prisma.TransactionClient) {
    const client = tx || defaultPrisma;
    return client.reservation.findMany({
      where: {
        status: "PENDING",
        expiresAt: { lt: now }
      },
      include: { inventory: true }
    });
  }
}
