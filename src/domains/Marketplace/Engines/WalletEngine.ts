import { prisma } from '@/lib/prisma';

export class WalletEngine {
  /**
   * Credits a specific balance type in the VendorWallet
   */
  static async creditWallet(tenantId: string, amount: number, balanceType: 'PENDING' | 'AVAILABLE' | 'RESERVED' | 'PAID'): Promise<void> {
    const updateData: any = {};
    if (balanceType === 'PENDING') updateData.pendingBalance = { increment: amount };
    if (balanceType === 'AVAILABLE') updateData.availableBalance = { increment: amount };
    if (balanceType === 'RESERVED') updateData.reservedBalance = { increment: amount };
    if (balanceType === 'PAID') updateData.paidBalance = { increment: amount };

    await prisma.vendorWallet.update({
      where: { tenantId },
      data: updateData
    });
  }

  /**
   * Triggers a payout, moving Available -> Paid
   */
  static async executePayout(tenantId: string): Promise<void> {
    const wallet = await prisma.vendorWallet.findUnique({ where: { tenantId } });
    if (!wallet || wallet.availableBalance.toNumber() <= 0) return;

    const amount = wallet.availableBalance;
    
    // Abstract payment gateway payout here (e.g., Stripe Connect)
    console.log(`[WalletEngine] Payout executing for Tenant ${tenantId}: $${amount}`);

    await prisma.vendorWallet.update({
      where: { tenantId },
      data: {
        availableBalance: { decrement: amount },
        paidBalance: { increment: amount }
      }
    });
  }
}
