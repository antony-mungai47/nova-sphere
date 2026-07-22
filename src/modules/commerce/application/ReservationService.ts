import { InventoryRepository } from "../infrastructure/repositories/InventoryRepository";

export class ReservationService {
  /**
   * Creates a reservation for an order, valid for `ttlMinutes`.
   */
  static async create(orderId: string, items: Array<{ id: string, quantity: number }>, ttlMinutes: number = 15) {
    const expiresAt = new Date(Date.now() + ttlMinutes * 60000);
    for (const item of items) {
      await InventoryRepository.createReservation({
        productId: item.id, // Assuming item.id is the productId in our simplified structure
        orderId,
        quantity: item.quantity,
        status: "PENDING",
        expiresAt
      });
      // Increment reserved stock
      await InventoryRepository.reserveStock(item.id, item.quantity);
    }
  }

  /**
   * Extends the expiry time of a reservation.
   */
  static async extend(orderId: string, ttlMinutes: number = 15) {
    const newExpiresAt = new Date(Date.now() + ttlMinutes * 60000);
    await InventoryRepository.extendReservation(orderId, newExpiresAt);
  }

  /**
   * Commits the reservation, turning it into a permanent stock deduction.
   */
  static async commit(orderId: string) {
    await InventoryRepository.updateReservationStatus(orderId, "CONFIRMED");
    // In a fully detailed system, we might move reserved stock to fully deducted here
  }

  /**
   * Explicitly releases a reservation (e.g. if payment fails).
   */
  static async release(orderId: string) {
    const reservations = await InventoryRepository.getReservationsForOrder(orderId);
    for (const res of reservations) {
      await InventoryRepository.releaseStock(res.inventoryId, res.quantity);
    }
    await InventoryRepository.updateReservationStatus(orderId, "RELEASED");
  }

  /**
   * Expires all reservations that have passed their `expiresAt` time.
   */
  static async expire() {
    const expiredReservations = await InventoryRepository.findExpiredReservations(new Date());
    for (const res of expiredReservations) {
      if (res.status === "PENDING") {
        await InventoryRepository.releaseStock(res.inventoryId, res.quantity);
        await InventoryRepository.updateReservationStatusById(res.id, "EXPIRED");
      }
    }
  }
}
