import { Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/prisma";
import { InventoryRepository } from "../../infrastructure/repositories/InventoryRepository";
import { ProductStockRepository } from "../../infrastructure/repositories/ProductStockRepository";
import { DomainEvents } from "@/domains/Foundation/events/event-bus";
import { RuntimeGate } from "@/lib/observability/assertions";

export interface ReserveInventoryCommand {
  productId: string;
  orderId: string;
  quantity: number;
  traceId: string;
}

export interface ReleaseInventoryCommand {
  productId: string;
  orderId: string;
  quantity: number;
  traceId: string;
}

export interface CommitInventoryCommand {
  productId: string;
  orderId: string;
  quantity: number;
  traceId: string;
}

export class InventoryCommandService {
  /**
   * Reserves stock for an order. Fails if quantity exceeds available.
   * Emits 'inventory.reserved' upon successful commit.
   */
  static async reserveInventory(cmd: ReserveInventoryCommand, externalTx?: Prisma.TransactionClient) {
    const execute = async (tx: Prisma.TransactionClient) => {
      // 1. Idempotency Check
      const existingReservations = await InventoryRepository.getReservationsForOrder(cmd.orderId, tx);
      const existing = existingReservations.find(r => r.inventory.productId === cmd.productId);
      if (existing) {
        // Idempotent return - do not double deduct
        return true;
      }

      // 2. Fetch available stock and raw inventory
      const { availableStock, version } = await ProductStockRepository.getStock(cmd.productId, tx);
      const inventory = await InventoryRepository.getInventory(cmd.productId, tx);
      
      if (!inventory) {
        throw new Error(`Inventory configuration missing for product ${cmd.productId}`);
      }

      // 3. Enforce Oversell Invariant
      if (cmd.quantity > availableStock) {
        throw new Error(`Insufficient stock for product ${cmd.productId}`);
      }

      // 4. Deduct from available (ProductStock) and increment reserved (Inventory)
      await ProductStockRepository.decrementAvailableStock(cmd.productId, cmd.quantity, version, tx);
      await InventoryRepository.incrementReserved(inventory.id, cmd.quantity, tx);

      // 5. Create reservation record
      await InventoryRepository.createReservation({
        inventoryId: inventory.id,
        orderId: cmd.orderId,
        quantity: cmd.quantity,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
      }, tx);

      // 6. Gate 13: Assert Balance Invariant
      const newAvailable = availableStock - cmd.quantity;
      const newReserved = inventory.reserved + cmd.quantity;
      
      // The total stock (from warehouse perspective) is represented by inventory.quantity
      RuntimeGate.assertInventoryBalance(
        newAvailable,
        newReserved,
        0, // committed is implicitly handled by warehouse quantity deduction in this model
        inventory.quantity,
        cmd.traceId
      );

      return true;
    };

    if (externalTx) {
      await execute(externalTx);
    } else {
      await defaultPrisma.$transaction(execute, { maxWait: 20000, timeout: 30000 });
    }

    // Post-commit event emission
    DomainEvents.publish('inventory.reserved', {
      productId: cmd.productId,
      orderId: cmd.orderId,
      quantity: cmd.quantity,
      traceId: cmd.traceId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Acts as compensation command. Releases reserved stock back to available pool.
   * Emits 'inventory.released' upon successful commit.
   */
  static async releaseInventory(cmd: ReleaseInventoryCommand, externalTx?: Prisma.TransactionClient) {
    const execute = async (tx: Prisma.TransactionClient) => {
      // 1. Idempotency Check
      const existingReservations = await InventoryRepository.getReservationsForOrder(cmd.orderId, tx);
      const existing = existingReservations.find(r => r.inventory.productId === cmd.productId);
      if (!existing || existing.status === "RELEASED") {
        return true; // Idempotent return
      }

      const inventory = await InventoryRepository.getInventory(cmd.productId, tx);
      if (!inventory) throw new Error("Inventory not found");
      
      const { version } = await ProductStockRepository.getStock(cmd.productId, tx);

      await InventoryRepository.updateReservationStatus(cmd.orderId, "RELEASED", tx);
      await InventoryRepository.decrementReserved(inventory.id, cmd.quantity, tx);
      await ProductStockRepository.incrementAvailableStock(cmd.productId, cmd.quantity, version, tx);

      const { availableStock } = await ProductStockRepository.getStock(cmd.productId, tx);
      
      // Gate 13 Check
      RuntimeGate.assertInventoryBalance(
        availableStock,
        inventory.reserved - cmd.quantity,
        0,
        inventory.quantity,
        cmd.traceId
      );
    };

    if (externalTx) {
      await execute(externalTx);
    } else {
      await defaultPrisma.$transaction(execute, { maxWait: 20000, timeout: 30000 });
    }

    DomainEvents.publish('inventory.released', {
      productId: cmd.productId,
      orderId: cmd.orderId,
      quantity: cmd.quantity,
      traceId: cmd.traceId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Finalizes a reservation. Deducts from total warehouse quantity.
   * Emits 'inventory.committed' upon successful commit.
   */
  static async commitInventory(cmd: CommitInventoryCommand, externalTx?: Prisma.TransactionClient) {
    const execute = async (tx: Prisma.TransactionClient) => {
      // 1. Idempotency Check
      const existingReservations = await InventoryRepository.getReservationsForOrder(cmd.orderId, tx);
      const existing = existingReservations.find(r => r.inventory.productId === cmd.productId);
      if (!existing || existing.status === "COMMITTED") {
        return true; // Idempotent return
      }

      const inventory = await InventoryRepository.getInventory(cmd.productId, tx);
      if (!inventory) throw new Error("Inventory not found");

      await InventoryRepository.updateReservationStatus(cmd.orderId, "COMMITTED", tx);
      await InventoryRepository.commitReserved(inventory.id, cmd.quantity, tx);

      const { availableStock } = await ProductStockRepository.getStock(cmd.productId, tx);

      // Gate 13 Check
      // We decremented reserved and total warehouse quantity.
      RuntimeGate.assertInventoryBalance(
        availableStock,
        inventory.reserved - cmd.quantity,
        0, // we effectively deduct the total, so we balance against the newly reduced total
        inventory.quantity - cmd.quantity,
        cmd.traceId
      );
    };

    if (externalTx) {
      await execute(externalTx);
    } else {
      await defaultPrisma.$transaction(execute, { maxWait: 20000, timeout: 30000 });
    }

    DomainEvents.publish('inventory.committed', {
      productId: cmd.productId,
      orderId: cmd.orderId,
      quantity: cmd.quantity,
      traceId: cmd.traceId,
      timestamp: new Date().toISOString()
    });
  }
}
