import { PaymentProvider } from "./payment/PaymentProvider";

export class PaymentService {
  constructor(private provider: PaymentProvider) {}

  async authorizePayment(orderId: string, successUrl: string, cancelUrl: string, idempotencyKey?: string): Promise<string> {
    return this.provider.createCheckoutSession(orderId, successUrl, cancelUrl, idempotencyKey);
  }
}
