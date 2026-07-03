import { prisma } from '@/lib/prisma';
import { CommissionEngine } from './CommissionEngine';
import { WalletEngine } from './WalletEngine';

export class SettlementEngine {
  /**
   * Processes a VendorOrder settlement, calculating net payout and updating the wallet.
   */
  static async settleOrder(vendorOrderId: string): Promise<void> {
    const order = await prisma.vendorOrder.findUnique({
      where: { id: vendorOrderId },
      include: { tenant: true }
    });

    if (!order) return;

    // Settlement Math
    const platformFee = CommissionEngine.calculatePlatformFee(order.tenant.plan, order.amountBase.toNumber());
    const tax = order.tax.toNumber(); // Assuming platform remits tax, subtract it. If vendor remits, leave it.
    const netPayout = order.amountBase.toNumber() - platformFee - tax;

    await WalletEngine.creditWallet(order.tenantId, netPayout, 'AVAILABLE');
  }
}
