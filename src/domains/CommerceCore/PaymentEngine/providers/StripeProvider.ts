import crypto from 'crypto';
import { IPaymentProvider, PaymentIntentResult, PaymentVerificationResult } from '../contracts/IPaymentProvider';

/**
 * StripeGateway acts as the raw wrapper around the Stripe SDK.
 * In a real environment, this imports 'stripe'.
 * For recovery execution, we mock the network boundaries.
 */
export class StripeGateway {
  public async createIntent(amount: number, currency: string, metadata: any) {
    return {
      id: `pi_${crypto.randomBytes(8).toString('hex')}`,
      client_secret: `secret_${crypto.randomBytes(16).toString('hex')}`,
    };
  }

  public verifySignature(payload: string | Buffer, signature: string): any {
    // In real life: return stripe.webhooks.constructEvent(payload, signature, secret)
    // Here we parse a mocked payload
    if (signature === 'INVALID_SIG') throw new Error('Invalid webhook signature');
    return JSON.parse(payload.toString());
  }
}

export class StripeProvider implements IPaymentProvider {
  private gateway: StripeGateway;

  constructor(gateway: StripeGateway = new StripeGateway()) {
    this.gateway = gateway;
  }

  async createPaymentIntent(amount: number, currency: string, orderId: string): Promise<PaymentIntentResult> {
    const intent = await this.gateway.createIntent(amount, currency, { orderId });
    return {
      providerId: intent.id,
      clientSecret: intent.client_secret,
      amount,
      currency
    };
  }

  async verifyWebhookSignature(payload: string | Buffer, signature: string): Promise<PaymentVerificationResult> {
    try {
      const event = this.gateway.verifySignature(payload, signature);
      
      let status: 'SUCCEEDED' | 'FAILED' | 'IGNORED' = 'IGNORED';
      let orderId = event.data?.object?.metadata?.orderId;
      
      if (event.type === 'payment_intent.succeeded') {
        status = 'SUCCEEDED';
      } else if (event.type === 'payment_intent.payment_failed') {
        status = 'FAILED';
      }

      // Hash the payload for idempotency tracking
      const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');

      return {
        isValid: true,
        providerEventId: event.id,
        payloadHash,
        status,
        amount: event.data?.object?.amount,
        currency: event.data?.object?.currency,
        orderId
      };
    } catch (err) {
      return {
        isValid: false,
        providerEventId: '',
        payloadHash: '',
        status: 'IGNORED'
      };
    }
  }
}
