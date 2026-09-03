import { Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/prisma";

export class ProductStockRepository {
  /**
   * Retrieves current stock values and version.
   */
  static async getStock(productId: string, tx?: Prisma.TransactionClient) {
    const client = tx || defaultPrisma;
    const product = await client.product.findUnique({
      where: { id: productId },
      select: { stock: true, version: true }
    });
    
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }
    
    return {
      availableStock: product.stock,
      version: product.version
    };
  }

  /**
   * Decrements available stock (for reservation) with optimistic concurrency.
   */
  static async decrementAvailableStock(productId: string, quantity: number, currentVersion: number, tx: Prisma.TransactionClient) {
    const res = await tx.product.updateMany({
      where: { id: productId, version: currentVersion },
      data: { 
        stock: { decrement: quantity },
        version: { increment: 1 } 
      }
    });

    if (res.count === 0) {
      throw new Error("ConcurrencyConflictException: The product stock was modified by another transaction.");
    }
    return res;
  }

  /**
   * Increments available stock (for compensation/release) with optimistic concurrency.
   */
  static async incrementAvailableStock(productId: string, quantity: number, currentVersion: number, tx: Prisma.TransactionClient) {
    const res = await tx.product.updateMany({
      where: { id: productId, version: currentVersion },
      data: { 
        stock: { increment: quantity },
        version: { increment: 1 }
      }
    });

    if (res.count === 0) {
      throw new Error("ConcurrencyConflictException: The product stock was modified by another transaction.");
    }
    return res;
  }
}

