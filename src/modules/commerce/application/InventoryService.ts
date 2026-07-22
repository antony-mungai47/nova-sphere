import { InventoryRepository } from "../infrastructure/repositories/InventoryRepository";

export class InventoryService {
  static async reserveInventory(items: Array<{id: string, quantity: number}>) {
    // 1. Check Availability
    for (const item of items) {
      await InventoryService.validateAvailability(item.id, item.quantity);
    }

    // 2. Reserve (In this simplification, decrement stock immediately)
    for (const item of items) {
      await InventoryRepository.reserveStock(item.id, item.quantity);
    }
  }

  static async validateAvailability(productId: string, quantity: number, tx: any = null) {
    const stock = await InventoryRepository.checkStock(productId);
    if (stock < quantity) {
      throw new Error(`Insufficient stock for product ${productId}`);
    }
  }

  static async commitInventory(orderId: string) {
    // In a two-phase commit system, this converts reservation to permanent deduction.
    // For now, reserveInventory already decremented, so commit is a no-op marker.
  }

  static async releaseInventory(items: Array<{id: string, quantity: number}>) {
    // If payment fails, we release the reservation
    for (const item of items) {
      await InventoryRepository.releaseStock(item.id, item.quantity);
    }
  }
}
