import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export class ReconciliationEngine {
  /**
   * Run daily via Cron to ensure Stripe Balance Transactions match our Ledger.
   */
  static async reconcileDaily() {
    if (!stripe) return;

    // Fetch the last 24 hours of Stripe balance transactions
    const yesterday = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
    const balanceTransactions = await stripe.balanceTransactions.list({
      created: { gte: yesterday }
    });

    const mismatches = [];

    for (const tx of balanceTransactions.data) {
      if (tx.type === 'charge' && tx.source) {
        // Find corresponding Ledger Entry by Stripe ID
        const ledgerEntry = await prisma.paymentTransaction.findFirst({
          where: { providerId: tx.source as string }
        });

        if (!ledgerEntry) {
          mismatches.push({ stripeId: tx.id, issue: "Missing in Nova Ledger" });
          continue;
        }

        const stripeAmountStr = (tx.amount / 100).toFixed(2);
        const ledgerAmountStr = Number(ledgerEntry.amount).toFixed(2);

        if (stripeAmountStr !== ledgerAmountStr) {
          mismatches.push({ 
            stripeId: tx.id, 
            issue: `Amount mismatch. Stripe: ${stripeAmountStr}, Ledger: ${ledgerAmountStr}` 
          });
        }
      }
    }

    if (mismatches.length > 0) {
      // In production, emit to APM or Incident table
      console.error("[RECONCILIATION_FAILED]", mismatches);
      await prisma.incident.create({
        data: {
          title: "Payment Reconciliation Mismatch",
          affectedService: "Finance",
          severity: "CRITICAL",
          startedAt: new Date(),
          detectedAt: new Date(),
          summary: "Mismatches: " + JSON.stringify(mismatches)
        }
      });
    }

    return { status: "COMPLETED", mismatchesFound: mismatches.length };
  }
}
