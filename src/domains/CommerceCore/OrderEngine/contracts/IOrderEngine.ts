import { OrderStatus } from '@prisma/client';

export interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  idempotencyKey: string;
  totalAmount: number;
  timestamp: Date;
}

export interface OrderStateChangedEvent {
  orderId: string;
  previousState: string;
  newState: string;
  actor: string;
  reason: string;
  timestamp: Date;
}

export interface OrderFailedEvent {
  orderId: string;
  reason: string;
  timestamp: Date;
}

export interface IOrderEventBus {
  publishOrderCreated(event: OrderCreatedEvent): Promise<void>;
  publishOrderStateChanged(event: OrderStateChangedEvent): Promise<void>;
  publishOrderFailed(event: OrderFailedEvent): Promise<void>;
}

export interface IOrderEngine {
  /**
   * Idempotent order creation. If idempotencyKey exists, returns existing order.
   * State: CREATED
   */
  createDraftOrder(
    idempotencyKey: string,
    userId: string,
    subtotal: number,
    tax: number,
    shippingCost: number,
    discount: number
  ): Promise<string>; // Returns OrderId

  /**
   * General transition method validating via OrderStateMachine.
   */
  transitionOrder(
    orderId: string,
    nextState: OrderStatus,
    reason: string,
    actor: string
  ): Promise<void>;
}
