import { IPaymentEngine } from '../contracts/IPaymentEngine';
import { IPaymentProvider } from '../contracts/IPaymentProvider';
import { PrismaPaymentRepository } from '../repositories/PrismaPaymentRepository';
import { MetricsClient } from '../../../../lib/telemetry/MetricsClient';

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

  async processWebhook(payload: string | Buffer, signature: string): Promise<boolean> {
    const verification = await this.provider.verifyWebhookSignature(payload, signature);

    if (!verification.isValid || !verification.providerEventId) {
      MetricsClient.increment('payments_failed_total', 1, { reason: 'invalid_signature' });
      throw new Error('Invalid webhook signature');
    }

    // 1. Idempotency Check & Lock
    const acquired = await this.repository.checkAndLockWebhook(
      verification.providerEventId,
      'STRIPE',
      verification.payloadHash
    );

    if (!acquired) {
      // Already processed, return 200 safely
      MetricsClient.increment('payments_duplicate_total', 1, { type: 'webhook_event_duplicate' });
      return false;
    }

    try {
      if (verification.orderId) {
        // Business idempotency check
        const isCaptured = await this.repository.isOrderCaptured(verification.orderId);
        if (isCaptured) {
          // Already paid, ignore gracefully
          await this.repository.markWebhookProcessed(verification.providerEventId, 'IGNORED_DUPLICATE_BUSINESS_EVENT');
          MetricsClient.increment('payments_duplicate_total', 1, { type: 'business_duplicate' });
          return true;
        }

        const attemptId = await this.repository.createPaymentAttempt(verification.orderId);

        if (verification.status === 'SUCCEEDED') {
          await this.repository.recordSuccessfulPayment(
            attemptId,
            verification.orderId,
            verification.amount || 0,
            verification.currency || 'USD',
            verification.providerEventId, // Using event ID as provider transaction ID for now
            verification.providerEventId
          );
        } else if (verification.status === 'FAILED') {
          await this.repository.recordFailedPayment(
            attemptId,
            verification.orderId,
            verification.metadata?.reason || 'Payment Gateway Declined',
            verification.providerEventId,
            verification.providerEventId
          );
        }
      }

      await this.repository.markWebhookProcessed(verification.providerEventId, 'PROCESSED');
      MetricsClient.increment('payments_processed_total', 1, { status: verification.status });
      MetricsClient.timing('payments_latency_ms', Math.floor(Math.random() * 50) + 10); // Mock latency
      return true;
    } catch (err: any) {
      if (err.message.includes('CONCURRENCY_ERROR')) {
        MetricsClient.increment('payments_duplicate_total', 1, { type: 'db_concurrency_ignored' });
        await this.repository.markWebhookProcessed(verification.providerEventId, 'IGNORED_CONCURRENCY');
        return true;
      }
      
      if (err.message.includes('SIMULATED_OUTBOX_FAILURE')) {
        MetricsClient.increment('payments_outbox_failures_total');
        MetricsClient.increment('payments_rollbacks_total');
      }

      await this.repository.markWebhookProcessed(verification.providerEventId, 'FAILED');
      MetricsClient.increment('payments_failed_total', 1, { reason: 'processing_error' });
      throw err;
    }
  }
}
