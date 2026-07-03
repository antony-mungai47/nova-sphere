import { prisma } from "@/lib/prisma";

export class LedgerEngine {
  /**
   * Records a double-entry transaction.
   * Debits the system account, Credits the user/vendor account.
   */
  static async recordTransaction(params: {
    transactionId: string;
    orderId?: string;
    amount: number;
    currency: string;
    sourceAccountId: string;
    destinationAccountId: string;
    description: string;
  }) {
    // Wrap in a transaction to ensure double-entry consistency
    await prisma.$transaction(async (tx) => {
      // 1. Debit Source
      const sourceBalance = await this.getCurrentBalance(tx, params.sourceAccountId);
      const newSourceBalance = sourceBalance - params.amount;
      
      await tx.ledgerEntry.create({
        data: {
          accountId: params.sourceAccountId,
          transactionId: params.transactionId,
          orderId: params.orderId,
          type: "DEBIT",
          amount: params.amount,
          currency: params.currency,
          description: params.description,
          balanceSnapshot: newSourceBalance,
        }
      });

      // 2. Credit Destination
      const destBalance = await this.getCurrentBalance(tx, params.destinationAccountId);
      const newDestBalance = destBalance + params.amount;

      await tx.ledgerEntry.create({
        data: {
          accountId: params.destinationAccountId,
          transactionId: params.transactionId,
          orderId: params.orderId,
          type: "CREDIT",
          amount: params.amount,
          currency: params.currency,
          description: params.description,
          balanceSnapshot: newDestBalance,
        }
      });
    });
  }

  private static async getCurrentBalance(tx: any, accountId: string): Promise<number> {
    const lastEntry = await tx.ledgerEntry.findFirst({
      where: { accountId },
      orderBy: { createdAt: 'desc' }
    });
    return lastEntry ? Number(lastEntry.balanceSnapshot) : 0;
  }
}
