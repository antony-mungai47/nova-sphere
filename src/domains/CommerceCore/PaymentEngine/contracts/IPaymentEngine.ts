export interface PaymentCapturedEvent {
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  providerEventId: string;
}

export interface PaymentFailedEvent {
  orderId: string;
  reason: string;
  providerEventId: string;
}

export interface IPaymentEventBus {
  publishPaymentCaptured(event: PaymentCapturedEvent): Promise<void>;
  publishPaymentFailed(event: PaymentFailedEvent): Promise<void>;
}

export interface IPaymentEngine {
  /**
   * Initializes a payment intent via the underlying provider.
   */
  preparePayment(orderId: string, amount: number, currency: string): Promise<string>; // Returns clientSecret

  /**
   * Consumes webhook payloads, ensuring idempotency, double-entry bookkeeping,
   * and transactional outbox event publishing.
   */
  processWebhook(payload: string | Buffer, signature: string): Promise<boolean>;
}
