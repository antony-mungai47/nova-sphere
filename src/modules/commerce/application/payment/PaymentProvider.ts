export interface PaymentProvider {
  createCheckoutSession(orderId: string, successUrl: string, cancelUrl: string, idempotencyKey?: string): Promise<string>;
  capture?(paymentIntentId: string): Promise<boolean>;
  refund?(paymentIntentId: string, amount: number): Promise<boolean>;
  cancel?(paymentIntentId: string): Promise<boolean>;
  verifyWebhook?(body: string, signature: string, secret: string): Promise<any>;
  verifyPaymentStatus(idempotencyKey: string): Promise<{ status: string, checkoutUrl?: string, paymentReference?: string } | null>;
}
