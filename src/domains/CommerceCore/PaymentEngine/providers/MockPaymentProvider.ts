import { IPaymentProvider, PaymentIntentResult, PaymentVerificationResult } from '../contracts/IPaymentProvider';

export class MockPaymentProvider implements IPaymentProvider {
  async createPaymentIntent(amount: number, currency: string, orderId: string): Promise<PaymentIntentResult> {
    return {
      providerId: `pi_mock_${Date.now()}`,
      clientSecret: `secret_mock_${Date.now()}`,
      amount,
      currency
    };
  }

  async verifyWebhookSignature(payload: string | Buffer, signature: string): Promise<PaymentVerificationResult> {
    const payloadStr = payload.toString();
    // In our tests, payload will be JSON with mock fields
    let data: any = {};
    try {
      data = JSON.parse(payloadStr);
    } catch (e) {
      return {
        isValid: false,
        providerEventId: '',
        payloadHash: '',
        status: 'IGNORED'
      };
    }

    const scenario = data.scenario || 'success';
    const amount = data.amount || 100;
    const currency = data.currency || 'USD';
    const orderId = data.orderId;

    if (scenario === 'stripe_timeout') {
      // Simulate timeout by throwing or returning invalid
      throw new Error('Simulated Stripe Timeout');
    }
    
    if (scenario === 'payment_declined') {
      return {
        isValid: true,
        providerEventId: data.providerEventId || `evt_mock_${Date.now()}`,
        payloadHash: Buffer.from(payloadStr).toString('base64'),
        status: 'FAILED',
        amount,
        currency,
        orderId,
        metadata: { reason: 'card_declined' }
      };
    }

    // Default success scenario
    return {
      isValid: true,
      providerEventId: data.providerEventId || `evt_mock_${Date.now()}`,
      payloadHash: Buffer.from(payloadStr).toString('base64'),
      status: 'SUCCEEDED',
      amount,
      currency,
      orderId
    };
  }
}
