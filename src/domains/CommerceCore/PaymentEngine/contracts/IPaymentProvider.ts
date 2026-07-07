export interface PaymentIntentResult {
  providerId: string; // The Intent ID from the provider
  clientSecret: string; // Used by frontend to complete payment
  amount: number;
  currency: string;
}

export interface PaymentVerificationResult {
  isValid: boolean;
  providerEventId: string;
  payloadHash: string;
  status: 'SUCCEEDED' | 'FAILED' | 'IGNORED';
  amount?: number;
  currency?: string;
  orderId?: string;
  metadata?: Record<string, any>;
}

export interface IPaymentProvider {
  /**
   * Creates a payment intent for a specific amount and currency.
   */
  createPaymentIntent(amount: number, currency: string, orderId: string): Promise<PaymentIntentResult>;

  /**
   * Verifies the signature of an incoming webhook event.
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): Promise<PaymentVerificationResult>;
}
