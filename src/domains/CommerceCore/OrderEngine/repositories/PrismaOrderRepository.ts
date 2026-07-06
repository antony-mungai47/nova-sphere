import { PrismaClient, Order, OrderStatus } from '@prisma/client';

export class PrismaOrderRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Idempotent Order Creation.
   * If an order with the idempotencyKey already exists, it is returned instead of duplicated.
   */
  async createIdempotentOrder(
    idempotencyKey: string,
    userId: string,
    subtotal: number,
    tax: number,
    shippingCost: number,
    discount: number
  ): Promise<Order> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Check idempotency
      const existing = await tx.order.findUnique({
        where: { idempotencyKey }
      });
      if (existing) {
        return existing;
      }

      // 2. Create the order
      const totalAmount = subtotal + tax + shippingCost - discount;
      const order = await tx.order.create({
        data: {
          idempotencyKey,
          userId,
          status: 'CREATED',
          subtotal,
          tax,
          shippingCost,
          discount,
          totalAmount,
          version: 1
        }
      });

      // 3. Write Timeline
      await tx.orderTimeline.create({
        data: {
          orderId: order.id,
          status: 'CREATED',
          actor: 'SYSTEM',
          newState: 'CREATED',
          reason: 'Order Initiated',
          metadata: { idempotencyKey }
        }
      });

      return order;
    });
  }

  /**
   * Retrieves order by ID.
   */
  async getOrder(orderId: string): Promise<Order | null> {
    return this.prisma.order.findUnique({ where: { id: orderId } });
  }

  /**
   * Transitions an order state transactionally with optimistic concurrency.
   */
  async transitionOrderAtomic(
    orderId: string,
    expectedVersion: number,
    nextState: OrderStatus,
    reason: string,
    actor: string
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error('Order not found');

      // Optimistic Concurrency Check using Prisma's updateMany
      const updated = await tx.order.updateMany({
        where: {
          id: orderId,
          version: expectedVersion
        },
        data: {
          status: nextState,
          version: { increment: 1 }
        }
      });

      if (updated.count === 0) {
        throw new Error(`Optimistic Concurrency Failure: Order ${orderId} was modified by another process. Expected version: ${expectedVersion}`);
      }

      // Write Timeline
      await tx.orderTimeline.create({
        data: {
          orderId,
          status: nextState,
          previousState: order.status,
          newState: nextState,
          actor,
          reason
        }
      });
    });
  }
}
