import { stripe } from "@/lib/stripe";
import { PaymentProvider } from "./PaymentProvider.interface";

export class StripeProvider implements PaymentProvider {
  name = "STRIPE";

  async createCheckoutSession({ orderId, items, successUrl, cancelUrl }: { orderId: string, items: any[], successUrl: string, cancelUrl: string }) {
    if (!stripe) {
      throw new Error("Stripe is not configured in the environment");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: item.currency.toLowerCase(),
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.amount * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId
      }
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url!
    };
  }

  async refund(paymentIntentId: string, amount?: number) {
    if (!stripe) throw new Error("Stripe not configured");
    
    const params: any = {
      payment_intent: paymentIntentId,
    };
    if (amount) params.amount = Math.round(amount * 100);

    const refund = await stripe.refunds.create(params);
    return {
      refundId: refund.id,
      status: refund.status!
    };
  }
}
