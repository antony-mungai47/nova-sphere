export interface PaymentProvider {
  name: string;
  createCheckoutSession(params: {
    orderId: string;
    items: Array<{ name: string; amount: number; currency: string; quantity: number }>;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ sessionId: string; checkoutUrl: string }>;
  
  refund(paymentIntentId: string, amount?: number): Promise<{ refundId: string; status: string }>;
}
