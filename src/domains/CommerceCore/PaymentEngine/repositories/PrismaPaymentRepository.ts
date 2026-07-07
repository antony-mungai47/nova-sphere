import { PrismaClient, TransactionStatus } from '@prisma/client';

export class PrismaPaymentRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Idempotent webhook tracking. Returns false if already processed.
   */
  async checkAndLockWebhook(providerEventId: string, provider: string, payloadHash: string): Promise<boolean> {
    try {
      await this.prisma.paymentWebhookEvent.create({
        data: {
          providerEventId,
          provider,
          payloadHash,
          status: 'PENDING',
          signatureVerified: true
        }
      });
      return true; // Lock acquired
    } catch (err: any) {
      // Prisma unique constraint violation means already processed
      if (err.code === 'P2002') return false;
      throw err;
    }
  }

  async markWebhookProcessed(providerEventId: string, status: string): Promise<void> {
    await this.prisma.paymentWebhookEvent.update({
      where: { providerEventId },
      data: { status, processedAt: new Date() }
    });
  }

  async createPaymentAttempt(orderId: string): Promise<string> {
    const attempt = await this.prisma.paymentAttempt.create({
      data: { orderId, status: 'CREATED' }
    });
    return attempt.id;
  }

  /**
   * Records successful payment using double-entry ledger bookkeeping and Transactional Outbox.
   */
  async recordSuccessfulPayment(
    paymentAttemptId: string,
    orderId: string,
    amount: number,
    currency: string,
    providerId: string,
    providerEventId: string
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Update attempt
      await tx.paymentAttempt.update({
        where: { id: paymentAttemptId },
        data: { status: 'CAPTURED' }
      });

      // 2. Create PaymentTransaction
      const transaction = await tx.paymentTransaction.create({
        data: {
          paymentAttemptId,
          type: 'CHARGE',
          amount,
          currency,
          provider: 'STRIPE',
          providerId,
          status: 'CAPTURED'
        }
      });

      // 3. Double-Entry Ledgers (Credit Revenue, Debit Gateway)
      await tx.ledgerEntry.createMany({
        data: [
          {
            accountId: 'SYSTEM_REVENUE',
            transactionId: transaction.id,
            orderId,
            type: 'CREDIT',
            amount,
            currency,
            description: `Payment captured for Order ${orderId}`,
            balanceSnapshot: 0 // In real system, query latest balance + amount
          },
          {
            accountId: 'STRIPE_RECEIVABLE',
            transactionId: transaction.id,
            orderId,
            type: 'DEBIT',
            amount,
            currency,
            description: `Awaiting settlement for Order ${orderId}`,
            balanceSnapshot: 0
          }
        ]
      });

      // 4. Transactional Outbox
      await tx.outboxEvent.create({
        data: {
          eventType: 'PaymentCaptured',
          payload: { orderId, transactionId: transaction.id, amount, currency, providerEventId }
        }
      });
    });
  }

  async recordFailedPayment(
    paymentAttemptId: string,
    orderId: string,
    reason: string,
    providerId: string,
    providerEventId: string
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.paymentAttempt.update({
        where: { id: paymentAttemptId },
        data: { status: 'FAILED' }
      });

      await tx.paymentTransaction.create({
        data: {
          paymentAttemptId,
          type: 'CHARGE',
          amount: 0,
          currency: 'USD',
          provider: 'STRIPE',
          providerId,
          status: 'FAILED',
          metadata: { reason }
        }
      });

      await tx.outboxEvent.create({
        data: {
          eventType: 'PaymentFailed',
          payload: { orderId, reason, providerEventId }
        }
      });
    });
  }
}
