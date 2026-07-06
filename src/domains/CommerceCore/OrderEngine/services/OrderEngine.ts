import { OrderStatus } from '@prisma/client';
import { IOrderEngine, IOrderEventBus } from '../contracts/IOrderEngine';
import { PrismaOrderRepository } from '../repositories/PrismaOrderRepository';
import { OrderStateMachine } from './OrderStateMachine';

export class OrderEngine implements IOrderEngine {
  private repository: PrismaOrderRepository;
  private eventBus: IOrderEventBus;

  constructor(repository: PrismaOrderRepository, eventBus: IOrderEventBus) {
    this.repository = repository;
    this.eventBus = eventBus;
  }

  async createDraftOrder(
    idempotencyKey: string,
    userId: string,
    subtotal: number,
    tax: number,
    shippingCost: number,
    discount: number
  ): Promise<string> {
    const order = await this.repository.createIdempotentOrder(
      idempotencyKey,
      userId,
      subtotal,
      tax,
      shippingCost,
      discount
    );

    // If it's a freshly created order (not recovered from idempotency lock), emit created
    // We infer it's freshly created if the version is exactly 1 and status is CREATED
    // Technically, even if it's recovered, emitting it might be safe if events are idempotent, 
    // but typically we'd check if it was just inserted. For MVP, we emit.
    await this.eventBus.publishOrderCreated({
      orderId: order.id,
      userId,
      idempotencyKey,
      totalAmount: order.totalAmount.toNumber(),
      timestamp: new Date()
    });

    return order.id;
  }

  async transitionOrder(
    orderId: string,
    nextState: OrderStatus,
    reason: string,
    actor: string
  ): Promise<void> {
    const order = await this.repository.getOrder(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const currentState = order.status;

    // 1. Validate Transition declaratively
    OrderStateMachine.validateTransition(currentState, nextState);

    // 2. Perform Atomic Update with Optimistic Lock
    await this.repository.transitionOrderAtomic(
      orderId,
      order.version,
      nextState,
      reason,
      actor
    );

    // 3. Emit Domain Events for Saga pattern orchestration
    await this.eventBus.publishOrderStateChanged({
      orderId,
      previousState: currentState,
      newState: nextState,
      actor,
      reason,
      timestamp: new Date()
    });

    // 4. Specific Compensations (Sagas)
    if (nextState === 'FAILED') {
      await this.eventBus.publishOrderFailed({
        orderId,
        reason,
        timestamp: new Date()
      });
    }
  }
}
