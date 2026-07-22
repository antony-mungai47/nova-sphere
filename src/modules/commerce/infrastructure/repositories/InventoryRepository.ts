import { prisma } from "@/lib/prisma";

export class InventoryRepository {
  static async checkStock(productId: string): Promise<number> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true }
    });
    return product?.stock || 0;
  }

  static async reserveStock(productId: string, quantity: number) {
    return prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } }
    });
  }

  static async releaseStock(productId: string, quantity: number) {
    return prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: quantity } }
    });
  }

  static async getOrCreateInventory(productId: string): Promise<string> {
    const inventory = await prisma.inventory.findUnique({
      where: { productId }
    });
    if (inventory) return inventory.id;

    const warehouse = await prisma.warehouse.findFirst();
    let warehouseId = warehouse?.id;
    if (!warehouseId) {
      const newWh = await prisma.warehouse.create({ data: { name: "Default Warehouse" }});
      warehouseId = newWh.id;
    }

    const newInv = await prisma.inventory.create({
      data: {
        productId,
        warehouseId,
        quantity: 0
      }
    });
    return newInv.id;
  }

  static async createReservation(data: { productId: string, orderId: string, quantity: number, status: string, expiresAt: Date }) {
    const inventoryId = await this.getOrCreateInventory(data.productId);
    return prisma.reservation.create({
      data: {
        inventoryId,
        orderId: data.orderId,
        quantity: data.quantity,
        status: data.status,
        expiresAt: data.expiresAt
      }
    });
  }

  static async extendReservation(orderId: string, expiresAt: Date) {
    return prisma.reservation.updateMany({
      where: { orderId, status: "PENDING" },
      data: { expiresAt }
    });
  }

  static async updateReservationStatus(orderId: string, status: string) {
    return prisma.reservation.updateMany({
      where: { orderId },
      data: { status }
    });
  }

  static async updateReservationStatusById(id: string, status: string) {
    return prisma.reservation.update({
      where: { id },
      data: { status }
    });
  }

  static async getReservationsForOrder(orderId: string) {
    return prisma.reservation.findMany({
      where: { orderId },
      include: { inventory: true }
    });
  }

  static async findExpiredReservations(now: Date) {
    return prisma.reservation.findMany({
      where: {
        status: "PENDING",
        expiresAt: { lt: now }
      },
      include: { inventory: true }
    });
  }
}
