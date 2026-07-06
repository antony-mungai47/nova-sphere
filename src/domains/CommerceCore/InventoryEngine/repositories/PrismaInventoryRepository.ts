import { PrismaClient, Inventory, InventoryMovement } from '@prisma/client';
import { IInventoryEngine } from '../contracts/IInventoryEngine';

export class PrismaInventoryRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  /**
   * Directly get the inventory record for a product and warehouse.
   */
  async getInventory(productId: string, warehouseId: string): Promise<Inventory | null> {
    return this.prisma.inventory.findUnique({
      where: { productId },
    });
  }

  /**
   * Initializes inventory record if it does not exist.
   */
  async ensureInventoryExists(productId: string, warehouseId: string): Promise<Inventory> {
    const existing = await this.prisma.inventory.findUnique({
      where: { productId }
    });
    if (existing) return existing;

    return this.prisma.inventory.create({
      data: {
        productId,
        warehouseId,
        quantity: 0,
        reserved: 0
      }
    });
  }

  /**
   * Atomic Reservation: Increases reserved stock IF available stock is sufficient.
   * Throws if insufficient stock or inventory not found.
   */
  async reserveStockAtomic(productId: string, warehouseId: string, orderId: string, quantity: number, performedBy: string): Promise<void> {
    // We use a transaction to guarantee ledger accuracy
    await this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { productId } });
      if (!inventory) throw new Error(`Inventory not found for product ${productId}`);
      if (inventory.quantity - inventory.reserved < quantity) {
        throw new Error(`Insufficient stock for product ${productId}. Available: ${inventory.quantity - inventory.reserved}`);
      }

      // Optimistic concurrency: Ensure we only increment reserved if quantity is still sufficient
      const updated = await tx.inventory.updateMany({
        where: {
          productId,
          warehouseId,
          // DB level check: total quantity minus current reserved must be >= requested quantity
          // Prisma doesn't support comparing two columns directly in updateMany where clause easily,
          // so we use the fetched values as the optimistic lock base.
          quantity: inventory.quantity,
          reserved: inventory.reserved
        },
        data: {
          reserved: { increment: quantity }
        }
      });

      if (updated.count === 0) {
        throw new Error('Concurrent modification exception: Stock changed during reservation.');
      }

      await tx.inventoryMovement.create({
        data: {
          inventoryId: inventory.id,
          type: 'RESERVATION',
          quantity,
          beforeQuantity: inventory.quantity - inventory.reserved,
          afterQuantity: inventory.quantity - (inventory.reserved + quantity),
          reason: 'Checkout Reservation',
          referenceId: orderId,
          performedBy,
          source: 'SYSTEM'
        }
      });

      await tx.reservation.create({
        data: {
          inventoryId: inventory.id,
          orderId,
          quantity,
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
        }
      });
    });
  }

  /**
   * Atomic Commit: Finalizes a sale. Deducts total quantity and reserved quantity.
   */
  async commitReservationAtomic(productId: string, warehouseId: string, orderId: string, quantity: number, performedBy: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { productId } });
      if (!inventory) throw new Error('Inventory not found');

      const reservation = await tx.reservation.findFirst({
        where: { inventoryId: inventory.id, orderId, status: 'PENDING' }
      });

      if (!reservation) throw new Error('Pending reservation not found for order');

      const updated = await tx.inventory.updateMany({
        where: {
          productId,
          warehouseId,
          quantity: inventory.quantity,
          reserved: inventory.reserved
        },
        data: {
          quantity: { decrement: quantity },
          reserved: { decrement: quantity }
        }
      });

      if (updated.count === 0) {
        throw new Error('Concurrent modification exception during commit.');
      }

      await tx.reservation.update({
        where: { id: reservation.id },
        data: { status: 'CONFIRMED' }
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryId: inventory.id,
          type: 'SALE',
          quantity: -quantity,
          beforeQuantity: inventory.quantity - inventory.reserved,
          afterQuantity: inventory.quantity - inventory.reserved, // Total pool goes down, but available is same since it was reserved
          reason: 'Reservation Committed',
          referenceId: orderId,
          performedBy,
          source: 'SYSTEM'
        }
      });
    });
  }

  /**
   * Atomic Release: Releases a reservation without deducting total quantity.
   */
  async releaseReservationAtomic(productId: string, warehouseId: string, orderId: string, quantity: number, performedBy: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { productId } });
      if (!inventory) return;

      const reservation = await tx.reservation.findFirst({
        where: { inventoryId: inventory.id, orderId, status: 'PENDING' }
      });

      if (!reservation) return; // Already released or committed

      const updated = await tx.inventory.updateMany({
        where: {
          productId,
          warehouseId,
          reserved: inventory.reserved
        },
        data: {
          reserved: { decrement: quantity }
        }
      });

      if (updated.count === 0) throw new Error('Concurrent modification exception during release.');

      await tx.reservation.update({
        where: { id: reservation.id },
        data: { status: 'RELEASED' }
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryId: inventory.id,
          type: 'RELEASE',
          quantity,
          beforeQuantity: inventory.quantity - inventory.reserved,
          afterQuantity: inventory.quantity - (inventory.reserved - quantity),
          reason: 'Reservation Released',
          referenceId: orderId,
          performedBy,
          source: 'SYSTEM'
        }
      });
    });
  }

  /**
   * General stock adjustment (Restock, Damage)
   */
  async adjustStockAtomic(
    productId: string,
    warehouseId: string,
    delta: number,
    reason: string,
    performedBy: string,
    source: string,
    notes?: string
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { productId } });
      if (!inventory && delta < 0) throw new Error('Inventory not found for deduction');
      
      let targetInvId = inventory?.id;
      let beforeQty = inventory ? inventory.quantity - inventory.reserved : 0;
      let afterQty = beforeQty + delta;
      
      if (!inventory) {
        if (delta < 0) throw new Error('Cannot reduce stock below 0');
        const newInv = await tx.inventory.create({
          data: { productId, warehouseId, quantity: delta, reserved: 0 }
        });
        targetInvId = newInv.id;
      } else {
        if (inventory.quantity + delta < 0) throw new Error('Cannot reduce stock below 0');
        
        const updated = await tx.inventory.updateMany({
          where: { productId, warehouseId, quantity: inventory.quantity },
          data: { quantity: { increment: delta } }
        });
        if (updated.count === 0) throw new Error('Concurrent modification exception during adjustment.');
      }

      let type = delta > 0 ? 'RESTOCK' : 'DAMAGE'; // Fallback if not specified

      await tx.inventoryMovement.create({
        data: {
          inventoryId: targetInvId!,
          type,
          quantity: delta,
          beforeQuantity: beforeQty,
          afterQuantity: afterQty,
          reason,
          performedBy,
          source,
          notes
        }
      });
    });
  }
}
