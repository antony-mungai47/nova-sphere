import { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/prisma";
import { InventoryRepository } from "../../infrastructure/repositories/InventoryRepository";
import { ProductStockRepository } from "../../infrastructure/repositories/ProductStockRepository";
import { DomainEvents } from "@/domains/Foundation/events/event-bus";
import { RuntimeGate } from "@/lib/observability/assertions";
import { CheckoutMetrics } from "../sagas/CheckoutMetrics";

export class InventoryExpirationService {
  /**
   * Sweeps expired PENDING reservations and releases reserved quantities back to available stock.
   * Serves as the passive last-resort safety net (Gate 19) when active compensation fails or crashes.
   */
  static async sweepExpiredReservations(prisma: PrismaClient = defaultPrisma): Promise<number> {
    const now = new Date();
    const expired = await InventoryRepository.findExpiredReservations(now);

    if (expired.length === 0) return 0;

    let releasedCount = 0;

    for (const res of expired) {
      try {
        await prisma.$transaction(async (tx) => {
          // 1. Re-verify status inside transaction
          const current = await tx.reservation.findUnique({ where: { id: res.id } });
          if (!current || current.status !== "PENDING") return;

          const productId = res.inventory.productId;
          const { version, availableStock } = await ProductStockRepository.getStock(productId, tx);
          const inventory = await InventoryRepository.getInventory(productId, tx);
          if (!inventory) return;

          // 2. Mark reservation as EXPIRED
          await tx.reservation.update({
            where: { id: res.id },
            data: { status: "EXPIRED" }
          });

          // 3. Decrement reserved on Inventory & increment available on ProductStock
          await InventoryRepository.decrementReserved(inventory.id, res.quantity, tx);
          await ProductStockRepository.incrementAvailableStock(productId, res.quantity, version, tx);

          // 4. Assert Gate 13 invariant
          RuntimeGate.assertInventoryBalance(
            availableStock + res.quantity,
            inventory.reserved - res.quantity,
            0,
            inventory.quantity,
            `ttl-expiration-${res.orderId}`
          );
        });

        releasedCount++;
        CheckoutMetrics.increment("inventory_ttl_expired_released_total", 1, { productId: res.inventory.productId });
        
        DomainEvents.publish('inventory.expired', {
          reservationId: res.id,
          orderId: res.orderId,
          productId: res.inventory.productId,
          quantity: res.quantity,
          timestamp: new Date().toISOString()
        });
      } catch (error: any) {
        console.error(`[InventoryExpirationService] Error expiring reservation ${res.id}:`, error.message);
      }
    }

    return releasedCount;
  }
}
