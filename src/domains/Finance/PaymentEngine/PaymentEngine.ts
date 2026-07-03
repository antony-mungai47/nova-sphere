import { PaymentProvider } from "./PaymentProvider.interface";
import { StripeProvider } from "./StripeProvider";
import { prisma } from "@/lib/prisma";
import { LedgerEngine } from "../Ledger/LedgerEngine";

export class PaymentEngine {
  private provider: PaymentProvider;

  constructor(providerName: "STRIPE" = "STRIPE") {
    // For Phase 13, we inject Stripe by default
    if (providerName === "STRIPE") {
      this.provider = new StripeProvider();
    } else {
      throw new Error(`Provider ${providerName} not supported yet.`);
    }
  }

  async authorize(orderId: string, successUrl: string, cancelUrl: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    });

    if (!order) throw new Error("Order not found");

    const mappedItems = order.items.map(item => ({
      name: item.product.name,
      amount: Number(item.price),
      currency: order.currency,
      quantity: item.quantity
    }));

    // Update order status to Pending before redirecting
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PENDING" }
    });

    const { sessionId, checkoutUrl } = await this.provider.createCheckoutSession({
      orderId,
      items: mappedItems,
      successUrl,
      cancelUrl
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { stripeSessionId: sessionId }
    });

    return { checkoutUrl };
  }

  async capture(orderId: string, paymentIntentId: string, amount: number, currency: string) {
    // Update order to CAPTURED
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: "CAPTURED",
        stripePaymentIntentId: paymentIntentId 
      }
    });

    // Record the actual PaymentTransaction
    const tx = await prisma.paymentTransaction.create({
      data: {
        orderId,
        type: "CHARGE",
        amount,
        currency,
        provider: this.provider.name,
        providerId: paymentIntentId,
        status: "SUCCEEDED"
      }
    });

    // Record Ledger entries (Double-entry)
    // Credit System Revenue, Debit Accounts Receivable / Customer Wallet
    await LedgerEngine.recordTransaction({
      transactionId: tx.id,
      orderId,
      amount,
      currency,
      sourceAccountId: "ACCOUNTS_RECEIVABLE", // In a real system, this is the holding account
      destinationAccountId: "SYSTEM_REVENUE",
      description: `Payment captured for Order ${orderId}`
    });

    return tx;
  }
}
