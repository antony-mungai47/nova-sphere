import { InventoryRepository } from "../infrastructure/repositories/InventoryRepository";

import { prisma } from "@/lib/prisma";

export class InventoryService {
  static async reserveInventory(items: Array<{id: string, quantity: number}>) {
    // 1. Check Availability
    for (const item of items) {
      await InventoryService.validateAvailability(item.id, item.quantity);
    }

    // 2. Reserve
    for (const item of items) {
      const inv = await InventoryRepository.getInventory(item.id);
      if (inv) {
        await InventoryRepository.incrementReserved(inv.id, item.quantity, prisma);
      }
    }
  }

  static async validateAvailability(productId: string, quantity: number, tx: any = null) {
    const inv = await InventoryRepository.getInventory(productId, tx);
    const available = inv ? inv.quantity - inv.reserved : 0;
    if (available < quantity) {
      throw new Error(`Insufficient stock for product ${productId}`);
    }
  }

  static async commitInventory(orderId: string) {
    // Handled by saga
  }

  static async releaseInventory(items: Array<{id: string, quantity: number}>) {
    for (const item of items) {
      const inv = await InventoryRepository.getInventory(item.id);
      if (inv) {
        await InventoryRepository.decrementReserved(inv.id, item.quantity, prisma);
      }
    }
  }
}
