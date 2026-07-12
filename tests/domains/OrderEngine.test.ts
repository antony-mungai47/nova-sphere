import { OrderEngine } from '@/domains/CommerceCore/OrderEngine/services/OrderEngine';
import { PrismaOrderRepository } from '@/domains/CommerceCore/OrderEngine/repositories/PrismaOrderRepository';
import { IOrderEventBus } from '@/domains/CommerceCore/OrderEngine/contracts/IOrderEngine';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { Prisma } from '@prisma/client';

describe('OrderEngine', () => {
  const mockRepo = mockDeep<PrismaOrderRepository>();
  const mockEventBus = mockDeep<IOrderEventBus>();
  
  let engine: OrderEngine;

  beforeEach(() => {
    mockReset(mockRepo);
    mockReset(mockEventBus);
    engine = new OrderEngine(mockRepo, mockEventBus);
  });

  describe('createDraftOrder', () => {
    it('creates an order via repository and emits OrderCreated event', async () => {
      mockRepo.createIdempotentOrder.mockResolvedValue({
        id: 'ORDER_1',
        userId: 'USER_1',
        status: 'CREATED',
        idempotencyKey: 'IDEM_1',
        totalAmount: new Prisma.Decimal(100),
        subtotal: new Prisma.Decimal(80),
        tax: new Prisma.Decimal(10),
        shippingCost: new Prisma.Decimal(10),
        discount: new Prisma.Decimal(0),
        paymentStatus: 'PENDING',
        fulfillmentStatus: 'UNFULFILLED',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockEventBus.publishOrderCreated.mockResolvedValue();

      const result = await engine.createDraftOrder('IDEM_1', 'USER_1', 80, 10, 10, 0);

      expect(result).toBe('ORDER_1');
      expect(mockRepo.createIdempotentOrder).toHaveBeenCalledWith('IDEM_1', 'USER_1', 80, 10, 10, 0);
      expect(mockEventBus.publishOrderCreated).toHaveBeenCalledWith(expect.objectContaining({
        orderId: 'ORDER_1',
        userId: 'USER_1',
        idempotencyKey: 'IDEM_1',
        totalAmount: 100
      }));
    });
  });

  describe('transitionOrder', () => {
    it('transitions the order status and emits status changed event', async () => {
      mockRepo.getOrder.mockResolvedValue({ status: 'CREATED', version: 1, id: 'ORDER_1' } as any);
      mockRepo.transitionOrderAtomic.mockResolvedValue();
      mockEventBus.publishOrderStateChanged.mockResolvedValue();

      await engine.transitionOrder('ORDER_1', 'PENDING', 'Payment Initialized', 'user_123');

      expect(mockRepo.getOrder).toHaveBeenCalledWith('ORDER_1');
      expect(mockRepo.transitionOrderAtomic).toHaveBeenCalledWith('ORDER_1', 1, 'PENDING', 'Payment Initialized', 'user_123');
      expect(mockEventBus.publishOrderStateChanged).toHaveBeenCalledWith(expect.objectContaining({
        orderId: 'ORDER_1',
        previousState: 'CREATED',
        newState: 'PENDING'
      }));
    });

    it('throws error if state transition is invalid', async () => {
      mockRepo.getOrder.mockResolvedValue({ status: 'CANCELLED', version: 1, id: 'ORDER_1' } as any);

      await expect(engine.transitionOrder('ORDER_1', 'PENDING', 'Reason', 'user_123'))
        .rejects.toThrow('Invalid State Transition: Cannot move from CANCELLED to PENDING');
    });
  });
});
