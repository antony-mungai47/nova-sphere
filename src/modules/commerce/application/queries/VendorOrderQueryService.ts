import { prisma } from "@/lib/prisma";

export class VendorOrderQueryService {
  static async getVendorOrders(tenantId: string) {
    const products = await prisma.product.findMany({
      where: { ownerTenantId: tenantId },
      select: { id: true, name: true }
    });
    
    const productIds = products.map(p => p.id);

    const orderItems = await prisma.orderItem.findMany({
      where: { productId: { in: productIds } },
      include: { 
        order: {
          include: { user: true }
        }
      },
      orderBy: { order: { createdAt: 'desc' } }
    });

    return orderItems.map(item => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      productName: products.find(p => p.id === item.productId)?.name || 'Unknown',
      quantity: item.quantity,
      price: Number(item.price),
      orderDate: item.order.createdAt,
      orderStatus: item.order.status,
      customerEmail: item.order.user.email,
      customerName: item.order.user.name
    }));
  }
}
