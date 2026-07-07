import { prisma } from '@/lib/prisma';

export class VendorWalletService {
  /**
   * Initializes a VendorWallet with zero balances for a new Tenant.
   */
  static async createWallet(tenantId: string) {
    return await prisma.vendorWallet.create({
      data: { tenantId }
    });
  }

  /**
   * Records a Vendor Liability when an order is split and assigned to a vendor.
   * This is an immutable double-entry ledger record.
   */
  static async recordVendorEarnings(tenantId: string, vendorOrderId: string, netPayout: number, currency: string) {
    // Determine wallet to map the transaction to
    const wallet = await prisma.vendorWallet.findUnique({ where: { tenantId } });
    if (!wallet) throw new Error("Vendor Wallet not found");

    await prisma.$transaction(async (tx) => {
      // 1. Immutable Ledger Entries
      // Debit the Marketplace Held Funds (Liability)
      await tx.ledgerEntry.create({
        data: {
          accountId: 'MARKETPLACE_LIABILITY',
          orderId: vendorOrderId,
          type: 'DEBIT',
          amount: netPayout,
          currency,
          description: `Vendor payout held for Order ${vendorOrderId}`,
          balanceSnapshot: 0 
        }
      });

      // Credit the Vendor Liability (Pending Balance)
      await tx.ledgerEntry.create({
        data: {
          accountId: `VENDOR_LIABILITY_${tenantId}`,
          orderId: vendorOrderId,
          type: 'CREDIT',
          amount: netPayout,
          currency,
          description: `Vendor earnings pending for Order ${vendorOrderId}`,
          balanceSnapshot: 0
        }
      });

      // 2. Wallet Projection Update
      await tx.vendorWallet.update({
        where: { tenantId },
        data: {
          pendingBalance: { increment: netPayout }
        }
      });
    });
  }
}
