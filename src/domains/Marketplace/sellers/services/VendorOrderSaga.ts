import { prisma } from '@/lib/prisma';
import { CommissionEngine } from './CommissionEngine';
import { VendorWalletService } from './VendorWalletService';
import { SettlementStatus } from '@prisma/client';

export class VendorOrderSaga {
  /**
   * Split the canonical Order into VendorOrders based on product ownership.
   */
  static async splitOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!order) throw new Error("Order not found");

    // Group items by TenantId
    const tenantGroups = new Map<string, any[]>();
    for (const item of order.items) {
      const tenantId = item.product.ownerTenantId;
      if (!tenantId) {
        throw new Error(`Product ${item.productId} has no ownerTenantId. Cannot route order.`);
      }

      if (!tenantGroups.has(tenantId)) {
        tenantGroups.set(tenantId, []);
      }
      tenantGroups.get(tenantId)!.push(item);
    }

    // Create VendorOrders and process Wallet updates inside a saga execution loop
    // (In production, this would be idempotent and retryable)
    for (const [tenantId, items] of tenantGroups.entries()) {
      await this.processVendorOrder(orderId, tenantId, items, order.currency);
    }
  }

  private static async processVendorOrder(orderId: string, tenantId: string, items: any[], currency: string) {
    // 1. Calculate Subtotal
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

    // 2. Evaluate Commissions
    const { vendorPayout } = await CommissionEngine.calculateCommission(tenantId, subtotal);

    // 3. Persist VendorOrder & Items
    const vendorOrder = await prisma.vendorOrder.create({
      data: {
        orderId,
        tenantId,
        amountBase: subtotal,
        amountSettlement: vendorPayout,
        settlementCurrency: currency,
        subtotal,
        status: 'PENDING',
        settlementStatus: SettlementStatus.PENDING,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.price
          }))
        }
      }
    });

    // 4. Update Wallet and Ledgers
    await VendorWalletService.recordVendorEarnings(tenantId, vendorOrder.id, vendorPayout, currency);

    // 5. Publish Event (e.g., VendorOrdersCreated for NotificationEngine)
    await prisma.outboxEvent.create({
      data: {
        eventType: 'VendorOrdersCreated',
        payload: { vendorOrderId: vendorOrder.id, tenantId, orderId }
      }
    });
  }
}
