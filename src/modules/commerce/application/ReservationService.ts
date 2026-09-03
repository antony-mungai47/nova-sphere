import { InventoryRepository } from "../infrastructure/repositories/InventoryRepository";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class ReservationService {
  /**
   * Creates a reservation for an order, valid for `ttlMinutes`.
   */
  static async create(orderId: string, items: Array<{ id: string, quantity: number }>, ttlMinutes: number = 15, tx?: Prisma.TransactionClient) {
    const expiresAt = new Date(Date.now() + ttlMinutes * 60000);

    const execute = async (db: Prisma.TransactionClient) => {
      for (const item of items) {
        const inventory = await InventoryRepository.getInventory(item.id, db);
        if (!inventory) throw new Error(`Inventory not found for product: ${item.id}`);

        if (inventory.quantity - inventory.reserved < item.quantity) {
          throw new Error(`Insufficient stock for product: ${item.id}`);
        }

        await InventoryRepository.createReservation({
          inventoryId: inventory.id,
          orderId,
          quantity: item.quantity,
          status: "PENDING",
          expiresAt
        }, db);
        
        // Increment reserved stock
        await InventoryRepository.incrementReserved(inventory.id, item.quantity, db);
      }
    };

    if (tx) {
      await execute(tx);
    } else {
      await prisma.$transaction(execute, { isolationLevel: 'Serializable' });
    }
  }

  /**
   * Extends the expiry time of a reservation.
   */
  static async extend(orderId: string, ttlMinutes: number = 15) {
    throw new Error("Not implemented yet");
  }

  /**
   * Commits the reservation, turning it into a permanent stock deduction.
   */
  static async commit(orderId: string, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    await InventoryRepository.updateReservationStatus(orderId, "CONFIRMED", db);
    const reservations = await InventoryRepository.getReservationsForOrder(orderId, db);
    for (const res of reservations) {
      await InventoryRepository.commitReserved(res.inventoryId, res.quantity, db);
    }
  }

  /**
   * Explicitly releases a reservation (e.g. if payment fails).
   */
  static async release(orderId: string, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    const reservations = await InventoryRepository.getReservationsForOrder(orderId, db);
    for (const res of reservations) {
      await InventoryRepository.decrementReserved(res.inventoryId, res.quantity, db);
    }
    await InventoryRepository.updateReservationStatus(orderId, "RELEASED", db);
  }

  /**
   * Expires all reservations that have passed their `expiresAt` time.
   */
  static async expire() {
    const expiredReservations = await InventoryRepository.findExpiredReservations(new Date());
    for (const res of expiredReservations) {
      if (res.status === "PENDING") {
        await InventoryRepository.decrementReserved(res.inventoryId, res.quantity, prisma);
        await prisma.reservation.update({
          where: { id: res.id },
          data: { status: "EXPIRED" }
        });
      }
    }
  }
}
