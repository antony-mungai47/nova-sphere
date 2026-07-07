import { PaymentEngine } from '../../src/domains/CommerceCore/PaymentEngine/services/PaymentEngine';
import { PrismaPaymentRepository } from '../../src/domains/CommerceCore/PaymentEngine/repositories/PrismaPaymentRepository';
import { StripeProvider, StripeGateway } from '../../src/domains/CommerceCore/PaymentEngine/providers/StripeProvider';

describe('PaymentEngine', () => {
  let prismaMock: any;
  let repository: PrismaPaymentRepository;
  let provider: StripeProvider;
  let engine: PaymentEngine;

  beforeEach(() => {
    prismaMock = {
      paymentWebhookEvent: {
        create: jest.fn(),
        update: jest.fn(),
      },
      paymentAttempt: {
        create: jest.fn().mockResolvedValue({ id: 'attempt_1' }),
        update: jest.fn(),
      },
      paymentTransaction: {
        create: jest.fn().mockResolvedValue({ id: 'tx_1' }),
      },
      ledgerEntry: {
        createMany: jest.fn(),
      },
      outboxEvent: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => {
        return cb(prismaMock);
      }),
    };

    repository = new PrismaPaymentRepository(prismaMock as any);
    
    // We mock the Gateway to control signature validation
    const mockGateway = new StripeGateway();
    mockGateway.verifySignature = jest.fn().mockReturnValue({
      id: 'evt_123',
      type: 'payment_intent.succeeded',
      data: {
        object: { amount: 1000, currency: 'USD', metadata: { orderId: 'order_1' } }
      }
    });

    provider = new StripeProvider(mockGateway);
    engine = new PaymentEngine(repository, provider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('preparePayment & Fraud Hook', () => {
    it('creates a payment attempt and returns client secret for LOW fraud score', async () => {
      // In PaymentEngine, default stub returns 'LOW'
      const secret = await engine.preparePayment('order_1', 1000, 'USD');
      
      expect(secret).toContain('secret_');
      expect(prismaMock.paymentAttempt.create).toHaveBeenCalledWith({
        data: { orderId: 'order_1', status: 'CREATED' }
      });
    });

    it('rejects payment intent if FraudEngine (stub) returns VERY_HIGH', async () => {
      // We force the private method using any cast for testing
      (engine as any).evaluateFraudScore = jest.fn().mockResolvedValue('VERY_HIGH');

      await expect(engine.preparePayment('order_1', 1000, 'USD'))
        .rejects.toThrow('Payment rejected by Fraud Rules');

      expect(prismaMock.paymentAttempt.create).not.toHaveBeenCalled();
    });
  });

  describe('Webhook Idempotency', () => {
    it('processes a new webhook and marks it PROCESSED', async () => {
      prismaMock.paymentWebhookEvent.create.mockResolvedValue(true); // lock acquired

      await engine.processWebhook('valid_payload', 'valid_sig');

      expect(prismaMock.paymentWebhookEvent.create).toHaveBeenCalled();
      expect(prismaMock.paymentWebhookEvent.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'PROCESSED' })
      }));
    });

    it('ignores duplicate webhooks safely', async () => {
      // Prisma throws P2002 for unique constraint violation on providerEventId
      const err = new Error('P2002') as any;
      err.code = 'P2002';
      prismaMock.paymentWebhookEvent.create.mockRejectedValue(err);

      await engine.processWebhook('duplicate_payload', 'valid_sig');

      // It should NOT proceed to update the attempt or write ledgers
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
      expect(prismaMock.paymentWebhookEvent.update).not.toHaveBeenCalled();
    });
  });

  describe('Double-Entry Ledgers & Outbox', () => {
    it('writes zero-sum ledgers and OutboxEvent for successful payments', async () => {
      prismaMock.paymentWebhookEvent.create.mockResolvedValue(true);

      await engine.processWebhook('payload', 'valid_sig');

      expect(prismaMock.ledgerEntry.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({ accountId: 'SYSTEM_REVENUE', type: 'CREDIT', amount: 1000 }),
          expect.objectContaining({ accountId: 'STRIPE_RECEIVABLE', type: 'DEBIT', amount: 1000 })
        ]
      });

      expect(prismaMock.outboxEvent.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ eventType: 'PaymentCaptured' })
      }));
    });
  });

  describe('Provider Failures & Compensation', () => {
    it('writes Failed OutboxEvent on declined payment intents', async () => {
      // Mock gateway to simulate payment_failed
      const mockGateway = new StripeGateway();
      mockGateway.verifySignature = jest.fn().mockReturnValue({
        id: 'evt_fail',
        type: 'payment_intent.payment_failed',
        data: {
          object: { metadata: { orderId: 'order_1' } }
        }
      });
      provider = new StripeProvider(mockGateway);
      engine = new PaymentEngine(repository, provider);

      prismaMock.paymentWebhookEvent.create.mockResolvedValue(true);

      await engine.processWebhook('payload', 'valid_sig');

      expect(prismaMock.paymentTransaction.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED' })
      }));

      expect(prismaMock.outboxEvent.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ eventType: 'PaymentFailed' })
      }));
    });
  });
});
