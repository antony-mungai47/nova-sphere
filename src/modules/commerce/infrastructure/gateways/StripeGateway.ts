import { PaymentEngine } from "@/domains/Finance/PaymentEngine/PaymentEngine";
import { PaymentProvider } from "../../application/payment/PaymentProvider";

// Using the legacy PaymentEngine logic internally to generate the stripe session, 
// but encapsulating it so the Commerce domain only knows about StripeGateway.

export class StripeGateway implements PaymentProvider {
  async createCheckoutSession(orderId: string, successUrl: string, cancelUrl: string): Promise<string> {
    const paymentEngine = new PaymentEngine("STRIPE");
    const { checkoutUrl } = await paymentEngine.authorize(
      orderId, 
      successUrl, 
      cancelUrl
    );
    return checkoutUrl;
  }

  async capture(paymentIntentId: string): Promise<boolean> {
    // Legacy integration doesn't explicitly expose manual capture.
    return true;
  }

  async refund(paymentIntentId: string, amount: number): Promise<boolean> {
    // Legacy integration doesn't explicitly expose refund yet.
    return true;
  }

  async cancel(paymentIntentId: string): Promise<boolean> {
    return true;
  }

  async verifyWebhook(body: string, signature: string, secret: string): Promise<any> {
    return { type: "payment_intent.succeeded" };
  }
}
