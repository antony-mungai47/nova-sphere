import { IPaymentEngine } from '../contracts/IPaymentEngine';
import { IPaymentProvider } from '../contracts/IPaymentProvider';
import { PrismaPaymentRepository } from '../repositories/PrismaPaymentRepository';

export class PaymentEngine implements IPaymentEngine {
  private repository: PrismaPaymentRepository;
  private provider: IPaymentProvider;

  constructor(repository: PrismaPaymentRepository, provider: IPaymentProvider) {
    this.repository = repository;
    this.provider = provider;
  }

  /**
   * Stub for future fraud engine rules
   */
  private async evaluateFraudScore(orderId: string, amount: number): Promise<'LOW' | 'HIGH' | 'VERY_HIGH'> {
    // In future, call FraudEngine here
    return 'LOW';
  }

  async preparePayment(orderId: string, amount: number, currency: string): Promise<string> {
    const fraudScore = await this.evaluateFraudScore(orderId, amount);
    if (fraudScore === 'VERY_HIGH') {
      throw new Error('Payment rejected by Fraud Rules');
    }

    const intent = await this.provider.createPaymentIntent(amount, currency, orderId);
    
    // We create a PaymentAttempt to track this transaction
    await this.repository.createPaymentAttempt(orderId);

    return intent.clientSecret;
  }

  async processWebhook(payload: string | Buffer, signature: string): Promise<void> {
    // 1. Validate signature via Provider
    const verification = await this.provider.verifyWebhookSignature(payload, signature);
    
    if (!verification.isValid || !verification.providerEventId) {
      throw new Error('Invalid Webhook Signature');
    }

    // 2. Idempotency Check
    const acquired = await this.repository.checkAndLockWebhook(
      verification.providerEventId,
      'STRIPE',
      verification.payloadHash
    );

    if (!acquired) {
      // Already processed, return 200 safely
      return;
    }

    try {
      if (verification.status === 'SUCCEEDED' && verification.orderId) {
        // Need to find the active attempt. For MVP, we assume the latest attempt.
        // In reality, you'd track attemptId via intent metadata.
        const fakeAttemptId = 'attempt_123'; // Simulating lookup

        await this.repository.recordSuccessfulPayment(
          fakeAttemptId,
          verification.orderId,
          verification.amount || 0,
          verification.currency || 'USD',
          verification.providerEventId, // Using event ID as provider transaction ID for now
          verification.providerEventId
        );
      } else if (verification.status === 'FAILED' && verification.orderId) {
        const fakeAttemptId = 'attempt_123';

        await this.repository.recordFailedPayment(
          fakeAttemptId,
          verification.orderId,
          'Payment Gateway Declined',
          verification.providerEventId,
          verification.providerEventId
        );
      }

      await this.repository.markWebhookProcessed(verification.providerEventId, 'PROCESSED');
    } catch (err: any) {
      await this.repository.markWebhookProcessed(verification.providerEventId, 'FAILED');
      throw err;
    }
  }
}
