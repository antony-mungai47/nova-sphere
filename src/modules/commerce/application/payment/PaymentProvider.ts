export interface PaymentProvider {
  createCheckoutSession(orderId: string, successUrl: string, cancelUrl: string): Promise<string>;
  capture(paymentIntentId: string): Promise<boolean>;
  refund(paymentIntentId: string, amount: number): Promise<boolean>;
  cancel(paymentIntentId: string): Promise<boolean>;
  verifyWebhook(body: string, signature: string, secret: string): Promise<any>;
}
