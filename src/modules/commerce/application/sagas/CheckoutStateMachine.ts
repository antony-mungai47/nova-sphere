import { CheckoutState, CheckoutEvent, CheckoutEffect, StateMachineResult, CheckoutSagaInstance } from "./CheckoutSaga.types";

export class CheckoutStateMachine {
  /**
   * Pure state transition function.
   * State + Event -> { NextState, Effect }
   * Unknown events or invalid transitions throw errors, unless they are safe to ignore (e.g. terminal state).
   */
  public static transition(saga: CheckoutSagaInstance, event: CheckoutEvent): StateMachineResult {
    const currentState = saga.currentState;

    // Terminal states cannot transition further
    if (this.isTerminal(currentState)) {
      // Re-delivery of events to a terminal state is harmless
      return { nextState: currentState, effect: CheckoutEffect.NONE };
    }

    switch (currentState) {
      case CheckoutState.INITIALIZED:
        if (event === CheckoutEvent.START) {
          return { nextState: CheckoutState.INITIALIZED, effect: CheckoutEffect.CALCULATE_PRICING };
        }
        if (event === CheckoutEvent.PRICING_SUCCESS) {
          return { nextState: CheckoutState.PRICING_CALCULATED, effect: CheckoutEffect.RESERVE_INVENTORY };
        }
        if (event === CheckoutEvent.PRICING_FAILURE) {
          return { nextState: CheckoutState.FAILED, effect: CheckoutEffect.NONE };
        }
        break;

      case CheckoutState.PRICING_CALCULATED:
        if (event === CheckoutEvent.INVENTORY_SUCCESS) {
          return { nextState: CheckoutState.INVENTORY_RESERVED, effect: CheckoutEffect.CREATE_ORDER };
        }
        if (event === CheckoutEvent.INVENTORY_FAILURE) {
          return { nextState: CheckoutState.FAILED, effect: CheckoutEffect.NONE };
        }
        if (event === CheckoutEvent.PRICING_SUCCESS) {
          // Duplicate event
          return { nextState: currentState, effect: CheckoutEffect.NONE };
        }
        break;

      case CheckoutState.INVENTORY_RESERVED:
        if (event === CheckoutEvent.ORDER_SUCCESS) {
          return { nextState: CheckoutState.ORDER_CREATED, effect: CheckoutEffect.AUTHORIZE_PAYMENT };
        }
        if (event === CheckoutEvent.ORDER_FAILURE) {
          return { nextState: CheckoutState.COMPENSATING, effect: this.getNextCompensation(saga) };
        }
        if (event === CheckoutEvent.INVENTORY_SUCCESS) {
          return { nextState: currentState, effect: CheckoutEffect.NONE };
        }
        break;

      case CheckoutState.ORDER_CREATED:
        if (event === CheckoutEvent.PAYMENT_SUCCESS) {
          return { nextState: CheckoutState.PAYMENT_AUTHORIZED, effect: CheckoutEffect.FINALIZE_CHECKOUT };
        }
        if (event === CheckoutEvent.PAYMENT_FAILURE) {
          return { nextState: CheckoutState.COMPENSATING, effect: this.getNextCompensation(saga) };
        }
        if (event === CheckoutEvent.ORDER_SUCCESS) {
          return { nextState: currentState, effect: CheckoutEffect.NONE };
        }
        break;

      case CheckoutState.PAYMENT_AUTHORIZED:
        if (event === CheckoutEvent.FINALIZE) {
          return { nextState: CheckoutState.COMPLETED, effect: CheckoutEffect.NONE };
        }
        if (event === CheckoutEvent.PAYMENT_SUCCESS) {
          return { nextState: currentState, effect: CheckoutEffect.NONE };
        }
        break;

      case CheckoutState.COMPENSATING:
        if (event === CheckoutEvent.COMPENSATION_SUCCESS) {
          const nextEffect = this.getNextCompensation(saga);
          if (nextEffect !== CheckoutEffect.NONE) {
            return { nextState: CheckoutState.COMPENSATING, effect: nextEffect };
          }
          return { nextState: CheckoutState.ROLLED_BACK, effect: CheckoutEffect.NONE };
        }
        if (event === CheckoutEvent.COMPENSATION_FAILURE) {
          return { nextState: CheckoutState.FAILED, effect: CheckoutEffect.NONE };
        }
        break;
    }

    throw new Error(`Invalid transition: Cannot process event ${event} in state ${currentState}`);
  }

  private static isTerminal(state: CheckoutState): boolean {
    return [CheckoutState.COMPLETED, CheckoutState.ROLLED_BACK, CheckoutState.FAILED].includes(state);
  }

  private static getNextCompensation(saga: CheckoutSagaInstance): CheckoutEffect {
    if (saga.orderCreated) return CheckoutEffect.CANCEL_ORDER;
    if (saga.inventoryReserved) return CheckoutEffect.RELEASE_INVENTORY;
    return CheckoutEffect.NONE;
  }

  /**
   * Replays the history to determine the current state deterministically.
   */
  public static replay(history: { event: CheckoutEvent }[]): CheckoutSagaInstance {
    const dummyIdentity = { checkoutId: "replay", tenantId: "replay", traceId: "replay", idempotencyKey: "replay" };
    let saga: CheckoutSagaInstance = {
      identity: dummyIdentity,
      currentState: CheckoutState.INITIALIZED,
      pricingCompleted: false,
      inventoryReserved: false,
      orderCreated: false,
      paymentAuthorized: false,
      compensationRequired: false,
      lastEvent: null,
      lastError: null,
      version: 1,
      history: [],
      completedEffects: []
    };

    for (const record of history) {
      // Mimic orchestrator mutating the explicit flags BEFORE transition
      if (record.event === CheckoutEvent.PRICING_SUCCESS) saga.pricingCompleted = true;
      if (record.event === CheckoutEvent.INVENTORY_SUCCESS) saga.inventoryReserved = true;
      if (record.event === CheckoutEvent.ORDER_SUCCESS) saga.orderCreated = true;
      if (record.event === CheckoutEvent.PAYMENT_SUCCESS) saga.paymentAuthorized = true;
      
      // When compensation succeeds, we clear the flag of the LAST effect requested
      if (record.event === CheckoutEvent.COMPENSATION_SUCCESS) {
        const lastEffect = saga.history[saga.history.length - 1]?.effect;
        if (lastEffect === CheckoutEffect.CANCEL_ORDER) saga.orderCreated = false;
        if (lastEffect === CheckoutEffect.RELEASE_INVENTORY) saga.inventoryReserved = false;
      }

      const { nextState, effect } = this.transition(saga, record.event);
      
      saga.history.push({
        checkoutId: saga.identity.checkoutId,
        previousState: saga.currentState,
        currentState: nextState,
        event: record.event,
        transitionId: "replay",
        timestamp: new Date(),
        step: saga.history.length + 1,
        attempt: 1,
        effect: effect
      });
      saga.currentState = nextState;
      saga.lastEvent = record.event;
      
      if (nextState === CheckoutState.COMPENSATING) saga.compensationRequired = true;

      if (effect !== CheckoutEffect.NONE && !saga.completedEffects.includes(effect)) {
        saga.completedEffects.push(effect);
      }
    }
    
    return saga;
  }
}
