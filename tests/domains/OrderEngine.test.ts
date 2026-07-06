import { OrderEngine } from '../../src/domains/CommerceCore/OrderEngine/services/OrderEngine';
import { PrismaOrderRepository } from '../../src/domains/CommerceCore/OrderEngine/repositories/PrismaOrderRepository';
import { IOrderEventBus } from '../../src/domains/CommerceCore/OrderEngine/contracts/IOrderEngine';
import { Decimal } from '@prisma/client/runtime/library';

describe('OrderEngine', () => {
  let prismaMock: any;
  let eventBusMock: IOrderEventBus;
  let repository: PrismaOrderRepository;
  let engine: OrderEngine;

  beforeEach(() => {
    prismaMock = {
      order: {
        findUnique: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
      },
      orderTimeline: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => {
        return cb(prismaMock);
      }),
    };

    eventBusMock = {
      publishOrderCreated: jest.fn().mockResolvedValue(undefined),
      publishOrderStateChanged: jest.fn().mockResolvedValue(undefined),
      publishOrderFailed: jest.fn().mockResolvedValue(undefined),
    };

    repository = new PrismaOrderRepository(prismaMock as any);
    engine = new OrderEngine(repository, eventBusMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Idempotent Creation', () => {
    it('returns existing order if idempotency key exists, avoiding duplicates', async () => {
      // Simulate existing order found
      const existingOrder = { id: 'order_1', idempotencyKey: 'idem_abc', totalAmount: new Decimal(100) };
      prismaMock.order.findUnique.mockResolvedValue(existingOrder);

      const orderId = await engine.createDraftOrder('idem_abc', 'user_1', 100, 10, 0, 0);

      expect(orderId).toBe('order_1');
      expect(prismaMock.order.create).not.toHaveBeenCalled();
    });

    it('creates new order if idempotency key is unique', async () => {
      prismaMock.order.findUnique.mockResolvedValue(null);
      prismaMock.order.create.mockResolvedValue({ id: 'order_2', totalAmount: new Decimal(110) });

      const orderId = await engine.createDraftOrder('idem_new', 'user_1', 100, 10, 0, 0);

      expect(orderId).toBe('order_2');
      expect(prismaMock.order.create).toHaveBeenCalled();
      expect(prismaMock.orderTimeline.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'CREATED', reason: 'Order Initiated' })
      }));
      expect(eventBusMock.publishOrderCreated).toHaveBeenCalledTimes(1);
    });
  });

  describe('State Machine & Concurrency', () => {
    it('prevents invalid state transitions (e.g., FAILED to AUTHORIZED)', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ id: 'order_3', status: 'FAILED', version: 1 });

      await expect(engine.transitionOrder('order_3', 'AUTHORIZED', 'Retry', 'SYSTEM'))
        .rejects.toThrow('Invalid State Transition: Cannot move from FAILED to AUTHORIZED');

      expect(prismaMock.order.updateMany).not.toHaveBeenCalled();
    });

    it('allows valid transitions (e.g., CREATED to PENDING)', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ id: 'order_4', status: 'CREATED', version: 1 });
      prismaMock.order.updateMany.mockResolvedValue({ count: 1 }); // Success

      await engine.transitionOrder('order_4', 'PENDING', 'Checkout started', 'SYSTEM');

      expect(prismaMock.order.updateMany).toHaveBeenCalledWith({
        where: { id: 'order_4', version: 1 },
        data: { status: 'PENDING', version: { increment: 1 } }
      });
      expect(prismaMock.orderTimeline.create).toHaveBeenCalled();
      expect(eventBusMock.publishOrderStateChanged).toHaveBeenCalledTimes(1);
    });

    it('throws Optimistic Concurrency Failure when versions mismatch (double charging prevention)', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ id: 'order_5', status: 'AUTHORIZED', version: 1 });
      
      // Simulate concurrent modification where the record was updated by another thread
      // causing updateMany to find 0 records matching id and old version.
      prismaMock.order.updateMany.mockResolvedValue({ count: 0 });

      await expect(engine.transitionOrder('order_5', 'CAPTURED', 'Payment Captured', 'STRIPE_WEBHOOK'))
        .rejects.toThrow('Optimistic Concurrency Failure');
    });
  });

  describe('Saga Compensation', () => {
    it('publishes OrderFailed event when transitioning to FAILED to trigger compensations', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ id: 'order_6', status: 'PENDING', version: 1 });
      prismaMock.order.updateMany.mockResolvedValue({ count: 1 });

      await engine.transitionOrder('order_6', 'FAILED', 'Card Declined', 'PAYMENT_GATEWAY');

      expect(eventBusMock.publishOrderFailed).toHaveBeenCalledTimes(1);
      expect(eventBusMock.publishOrderFailed).toHaveBeenCalledWith(expect.objectContaining({
        orderId: 'order_6',
        reason: 'Card Declined'
      }));
    });
  });
});
