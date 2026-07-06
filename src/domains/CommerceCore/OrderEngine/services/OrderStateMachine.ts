import { OrderStatus } from '@prisma/client';

export class OrderStateMachine {
  // Declarative mapping of Allowed Transitions
  private static readonly transitionMap: Record<OrderStatus, OrderStatus[]> = {
    CREATED: ['PENDING', 'FAILED', 'CANCELLED'],
    PENDING: ['AUTHORIZED', 'FAILED', 'CANCELLED'],
    AUTHORIZED: ['CAPTURED', 'PARTIALLY_CAPTURED', 'FAILED', 'CANCELLED'],
    CAPTURED: ['SHIPPED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
    PARTIALLY_CAPTURED: ['SHIPPED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
    FAILED: [], // Terminal
    REFUNDED: [], // Terminal
    PARTIALLY_REFUNDED: ['REFUNDED'],
    CHARGEBACK: [], // Terminal
    CANCELLED: [], // Terminal
    EXPIRED: [], // Terminal
    SHIPPED: ['DELIVERED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
    DELIVERED: ['REFUNDED', 'PARTIALLY_REFUNDED']
  };

  /**
   * Validates if transitioning from currentState to nextState is permitted.
   * Throws an error if invalid.
   */
  public static validateTransition(currentState: OrderStatus, nextState: OrderStatus): void {
    const allowed = this.transitionMap[currentState];
    if (!allowed || !allowed.includes(nextState)) {
      throw new Error(`Invalid State Transition: Cannot move from ${currentState} to ${nextState}`);
    }
  }
}
