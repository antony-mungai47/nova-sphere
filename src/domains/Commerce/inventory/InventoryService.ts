import { prisma } from "@/lib/prisma";
import { Prisma, ProductStatus } from "@prisma/client";

export class InventoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InventoryError";
  }
}

export class InventoryService {
  /**
   * Validates if a product is purchasable and has sufficient stock.
   * Throws an InventoryError if validation fails.
   */
  static async validateAvailability(
    productId: string, 
    requestedQuantity: number, 
    tx: Prisma.TransactionClient = prisma
  ): Promise<void> {
    const product = await tx.product.findUnique({
      where: { id: productId },
      include: { ownerTenant: true }
    });

    if (!product) {
      throw new InventoryError("Product not found");
    }

    if (product.status !== ProductStatus.ACTIVE) {
      throw new InventoryError("Product is not active");
    }

    // Tenant check if multi-tenant
    if (product.ownerTenantId && product.ownerTenant?.status !== "ACTIVE") {
      throw new InventoryError("Vendor is not active");
    }

    // Check Inventory record
    const inventory = await tx.inventory.findUnique({
      where: { productId }
    });

    // Fallback to Product.stock if Inventory model isn't populated for this product
    let availableStock = product.stock;

    if (inventory) {
      availableStock = inventory.quantity - inventory.reserved;
    }

    if (requestedQuantity > availableStock) {
      throw new InventoryError(`Insufficient stock. Only ${availableStock} available.`);
    }
  }

  /**
   * Locks inventory for checkout using a Serializable transaction.
   */
  static async lockInventoryForCheckout(
    items: { productId: string; quantity: number }[],
    orderId: string
  ): Promise<void> {
    // This executes as a Serializable transaction to prevent race conditions
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        // Validate
        await this.validateAvailability(item.productId, item.quantity, tx);

        // Deduct from stock or reserve it
        const inventory = await tx.inventory.findUnique({ where: { productId: item.productId } });
        
        if (inventory) {
           await tx.inventory.update({
             where: { productId: item.productId },
             data: {
               reserved: { increment: item.quantity }
             }
           });
           
           // Create reservation log
           await tx.reservation.create({
             data: {
               inventoryId: inventory.id,
               orderId,
               quantity: item.quantity,
               status: "PENDING",
               expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins lock
             }
           });
        } else {
           // Fallback for simple Product stock deduction
           await tx.product.update({
             where: { id: item.productId },
             data: {
               stock: { decrement: item.quantity }
             }
           });
        }
      }
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });
  }
}
