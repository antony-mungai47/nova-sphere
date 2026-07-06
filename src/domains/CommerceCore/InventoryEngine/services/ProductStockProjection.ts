import { PrismaClient } from '@prisma/client';
import { InventoryAdjustedEvent } from '../contracts/IInventoryEngine';

export class ProductStockProjection {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Projects the InventoryAdjustedEvent into the read-cache Product.stock
   */
  async handleInventoryAdjusted(event: InventoryAdjustedEvent): Promise<void> {
    // If the system has multiple warehouses, this projection would need to SUM
    // the available quantities across all warehouses for the product.
    // For MVP, we assume single warehouse or simply aggregate.
    
    // Calculate aggregate available stock across all warehouses
    const result = await this.prisma.inventory.aggregate({
      where: { productId: event.productId },
      _sum: {
        quantity: true,
        reserved: true
      }
    });

    const totalQty = result._sum.quantity || 0;
    const totalReserved = result._sum.reserved || 0;
    const aggregateAvailable = totalQty - totalReserved;

    // Update the read-cache
    await this.prisma.product.update({
      where: { id: event.productId },
      data: { stock: aggregateAvailable }
    });
  }
}
