import { PaymentEngine } from '@/domains/CommerceCore/PaymentEngine/services/PaymentEngine';
import { PrismaPaymentRepository } from '@/domains/CommerceCore/PaymentEngine/repositories/PrismaPaymentRepository';
import { IPaymentProvider } from '@/domains/CommerceCore/PaymentEngine/contracts/IPaymentProvider';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('PaymentEngine', () => {
  const mockRepo = mockDeep<PrismaPaymentRepository>();
  const mockProvider = mockDeep<IPaymentProvider>();
  
  let engine: PaymentEngine;

  beforeEach(() => {
    mockReset(mockRepo);
    mockReset(mockProvider);
    engine = new PaymentEngine(mockRepo, mockProvider);
  });

  describe('preparePayment', () => {
    it('creates a payment intent and returns the client secret', async () => {
      mockProvider.createPaymentIntent.mockResolvedValue({
        id: 'pi_123',
        clientSecret: 'secret_123',
        status: 'requires_payment_method'
      });
      mockRepo.createPaymentAttempt.mockResolvedValue({} as any);

      const secret = await engine.preparePayment('ORDER_1', 100, 'USD');

      expect(secret).toBe('secret_123');
      expect(mockProvider.createPaymentIntent).toHaveBeenCalledWith(100, 'USD', 'ORDER_1');
      expect(mockRepo.createPaymentAttempt).toHaveBeenCalledWith('ORDER_1');
    });
  });

  describe('processWebhook', () => {
    it('throws error if webhook signature is invalid', async () => {
      mockProvider.verifyWebhookSignature.mockResolvedValue({
        isValid: false,
        providerEventId: null
      });

      await expect(engine.processWebhook('payload', 'invalid_sig'))
        .rejects.toThrow('Invalid webhook signature');
    });

    // We only test the validation here. 
    // Further logic requires eventBus which is apparently handled in the outbox or saga.
  });
});
