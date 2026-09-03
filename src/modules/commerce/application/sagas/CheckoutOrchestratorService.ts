import { randomUUID } from "crypto";
import { 
  CheckoutIdentity, 
  CheckoutState, 
  CheckoutEvent, 
  CheckoutEffect,
  CheckoutSagaInstance,
  CheckoutSagaPayload,
  CheckoutResultDTO
} from "./CheckoutSaga.types";
import { CheckoutSagaStateStore, DuplicateIdempotencyKeyError } from "./CheckoutSagaStateStore";
import { CheckoutStateMachine } from "./CheckoutStateMachine";
import { CheckoutMetrics } from "./CheckoutMetrics";
import * as crypto from "crypto";

export class CheckoutConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutConflictError";
  }
}

import { PricingQueryService } from "../queries/PricingQueryService";
import { InventoryCommandService } from "../commands/InventoryCommandService";
import { OrderCommandService } from "../commands/OrderCommandService";
import { PaymentService } from "../PaymentService";
import { PaymentProvider } from "../payment/PaymentProvider";

/**
 * Deterministically serialize any JavaScript object into canonical JSON with sorted keys.
 * Guarantees that semantically identical objects produce the exact same fingerprint.
 */
export function canonicalStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalStringify(item)).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  const pairs = keys.map(key => `${JSON.stringify(key)}:${canonicalStringify(obj[key])}`);
  return '{' + pairs.join(',') + '}';
}

export class CheckoutOrchestratorService {
  constructor(
    private readonly store: CheckoutSagaStateStore,
    private readonly paymentProvider?: PaymentProvider
  ) {}

  public async startCheckout(identity: CheckoutIdentity, payload: CheckoutSagaPayload): Promise<CheckoutResultDTO> {
    const startTime = Date.now();
    CheckoutMetrics.increment("saga_starts_total", 1, { tenantId: identity.tenantId });

    const requestFingerprint = crypto.createHash('sha256').update(canonicalStringify(payload)).digest('hex');
    
    const saga: CheckoutSagaInstance = {
      identity,
      currentState: CheckoutState.INITIALIZED,
      pricingCompleted: false,
      inventoryReserved: false,
      orderCreated: false,
      paymentAuthorized: false,
      compensationRequired: false,
      lastEvent: null,
      lastError: null,
      version: 1,
      payload,
      requestFingerprint,
      history: [],
      completedEffects: []
    };

    try {
      await this.store.save(saga);
      await this.processEvent(identity.checkoutId, CheckoutEvent.START);
    } catch (e: any) {
      if (e instanceof DuplicateIdempotencyKeyError) {
        const existing = await this.store.loadByTenantAndIdempotencyKey(identity.tenantId, identity.idempotencyKey);
        if (!existing) throw e;
        
        if (existing.requestFingerprint !== requestFingerprint) {
          CheckoutMetrics.increment("idempotency_conflicts_409_total", 1, { tenantId: identity.tenantId });
          throw new CheckoutConflictError(`Idempotency key '${identity.idempotencyKey}' used with a different request payload.`);
        }
        
        CheckoutMetrics.increment("idempotency_safe_retries_total", 1, { tenantId: identity.tenantId });

        // If it's already in a terminal state, return it immediately.
        // If it's currently in progress, wait briefly for in-flight execution or resume if orphaned
        if (existing.currentState !== CheckoutState.COMPLETED && 
            existing.currentState !== CheckoutState.FAILED && 
            existing.currentState !== CheckoutState.ROLLED_BACK) {
          
          let current = existing;
          const maxWait = 5000;
          const pollInterval = 100;
          const startWait = Date.now();
          
          while (
            Date.now() - startWait < maxWait &&
            current.currentState !== CheckoutState.COMPLETED &&
            current.currentState !== CheckoutState.FAILED &&
            current.currentState !== CheckoutState.ROLLED_BACK
          ) {
            await new Promise(r => setTimeout(r, pollInterval));
            const reloaded = await this.store.load(existing.identity.checkoutId);
            if (reloaded) current = reloaded;
          }

          if (current.currentState !== CheckoutState.COMPLETED &&
              current.currentState !== CheckoutState.FAILED &&
              current.currentState !== CheckoutState.ROLLED_BACK) {
            try {
              await this.resume(current);
            } catch (resumeError: any) {
              console.warn(`[CheckoutOrchestrator] Safe concurrent idempotency retry caught OCC race: ${resumeError.message}`);
            }
          }
        }
        
        const updated = await this.store.load(existing.identity.checkoutId);
        return {
          checkoutId: existing.identity.checkoutId,
          status: updated?.currentState || CheckoutState.INITIALIZED,
          checkoutUrl: updated?.payload?.checkoutUrl,
          orderId: updated?.payload?.orderReference
        };
      }
      throw e;
    }
    
    // Determine result
    const updated = await this.store.load(identity.checkoutId);
    const duration = Date.now() - startTime;
    CheckoutMetrics.recordDuration("saga_duration_ms", duration, { 
      status: updated?.currentState || CheckoutState.INITIALIZED,
      tenantId: identity.tenantId 
    });

    return {
      checkoutId: identity.checkoutId,
      status: updated?.currentState || CheckoutState.INITIALIZED,
      checkoutUrl: updated?.payload?.checkoutUrl,
      orderId: updated?.payload?.orderReference
    };
  }

  public async processEvent(checkoutId: string, event: CheckoutEvent): Promise<void> {
    const saga = await this.store.load(checkoutId);
    if (!saga) {
      throw new Error(`Saga not found for checkoutId: ${checkoutId}`);
    }

    try {
      // 1. Mutate explicit flags based on the incoming event BEFORE transition
      if (event === CheckoutEvent.PRICING_SUCCESS) saga.pricingCompleted = true;
      if (event === CheckoutEvent.INVENTORY_SUCCESS) saga.inventoryReserved = true;
      if (event === CheckoutEvent.ORDER_SUCCESS) saga.orderCreated = true;
      if (event === CheckoutEvent.PAYMENT_SUCCESS) saga.paymentAuthorized = true;

      if (event === CheckoutEvent.COMPENSATION_SUCCESS) {
        const lastEffect = saga.history[saga.history.length - 1]?.effect;
        if (lastEffect === CheckoutEffect.CANCEL_ORDER) saga.orderCreated = false;
        if (lastEffect === CheckoutEffect.RELEASE_INVENTORY) saga.inventoryReserved = false;
      }

      // 2. Compute next state and effect
      const { nextState, effect } = CheckoutStateMachine.transition(saga, event);

      if (saga.currentState !== nextState || effect !== CheckoutEffect.NONE) {
        const previousState = saga.currentState;
        saga.history.push({
          checkoutId: saga.identity.checkoutId,
          previousState: saga.currentState,
          currentState: nextState,
          event,
          transitionId: randomUUID(),
          timestamp: new Date(),
          step: saga.history.length + 1,
          attempt: 1,
          effect
        });

        saga.currentState = nextState;
        saga.lastEvent = event;
        
        if (nextState === CheckoutState.COMPENSATING) {
          saga.compensationRequired = true;
          CheckoutMetrics.increment("saga_compensation_initiated_total", 1, { tenantId: saga.identity.tenantId });
        }

        saga.version += 1;
        
        await this.store.save(saga);

        CheckoutMetrics.increment("saga_transitions_total", 1, { 
          from: previousState, 
          to: nextState, 
          event 
        });
        CheckoutMetrics.gauge("saga_state_count", 1, { state: nextState });

        if (effect !== CheckoutEffect.NONE) {
          await this.executeEffect(saga, effect);
        }
      }
    } catch (error: any) {
      console.error(`CheckoutOrchestrator: Error processing event ${event}: ${error.message}`);
      throw error;
    }
  }

  private async executeEffect(saga: CheckoutSagaInstance, effect: CheckoutEffect): Promise<void> {
    let nextEvent: CheckoutEvent | null = null;
    try {
      if (!saga.payload) throw new Error("Saga payload is missing for effect execution");
      
      switch (effect) {
        case CheckoutEffect.CALCULATE_PRICING:
          const cartInput = {
            items: saga.payload.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.price || 0,
              tenantId: saga.identity.tenantId
            })),
            userId: saga.payload.userId,
            tenantId: saga.identity.tenantId,
            currency: 'USD'
          };
          
          const pricingResult = await PricingQueryService.calculateDiscounts(
            cartInput, 
            [], // No coupons passed for now
            saga.identity.traceId
          );
          
          saga.payload.pricingSnapshot = pricingResult;
          saga.version++;
          await this.store.save(saga); // Persist snapshot
          nextEvent = CheckoutEvent.PRICING_SUCCESS;
          break;
          
        case CheckoutEffect.RESERVE_INVENTORY:
          for (const item of saga.payload.items) {
            await InventoryCommandService.reserveInventory({
              productId: item.productId,
              orderId: saga.identity.checkoutId,
              quantity: item.quantity,
              traceId: saga.identity.traceId
            });
          }
          
          saga.payload.reservationReference = saga.identity.checkoutId;
          saga.version++;
          await this.store.save(saga);
          nextEvent = CheckoutEvent.INVENTORY_SUCCESS;
          break;
          
        case CheckoutEffect.CREATE_ORDER:
          if (!saga.payload.pricingSnapshot) throw new Error("Pricing snapshot missing before order creation");
          
          const order = await OrderCommandService.createOrder({
            userId: saga.payload.userId,
            tenantId: saga.identity.tenantId,
            items: saga.payload.items.map(i => ({ 
              productId: i.productId, 
              quantity: i.quantity, 
              price: i.price || 0 
            })),
            totalAmount: saga.payload.pricingSnapshot.finalPrice ?? saga.payload.clientTotal ?? 0,
            subtotal: saga.payload.pricingSnapshot.subtotal,
            tax: saga.payload.pricingSnapshot.tax || 0,
            shippingCost: saga.payload.pricingSnapshot.shippingCost || 0,
            discount: saga.payload.pricingSnapshot.discountAmount || 0,
            currency: saga.payload.pricingSnapshot.currency,
            idempotencyKey: saga.identity.idempotencyKey,
            traceId: saga.identity.traceId
          });
          
          saga.payload.orderReference = order.id;
          saga.version++;
          await this.store.save(saga);
          nextEvent = CheckoutEvent.ORDER_SUCCESS;
          break;
          
        case CheckoutEffect.AUTHORIZE_PAYMENT:
          if (this.paymentProvider) {
            // Payment Ambiguity Check: Verify if the payment was already authorized
            let alreadyAuthorized = false;
            
            if (saga.identity.idempotencyKey) {
              const status = await this.paymentProvider.verifyPaymentStatus(saga.identity.idempotencyKey);
              if (status && status.status === "AUTHORIZED") {
                saga.payload.checkoutUrl = status.checkoutUrl;
                saga.payload.paymentReference = status.paymentReference;
                alreadyAuthorized = true;
                CheckoutMetrics.increment("payment_ambiguity_detected_total", 1, { 
                  tenantId: saga.identity.tenantId,
                  resolution: "AUTHORIZED" 
                });
                console.log(`[CheckoutOrchestrator] Payment Ambiguity Resolved: Payment ${saga.identity.idempotencyKey} was already authorized.`);
              }
            }

            if (!alreadyAuthorized) {
              const paymentService = new PaymentService(this.paymentProvider);
              const url = await paymentService.authorizePayment(
                saga.payload.orderReference || saga.identity.checkoutId,
                "https://example.com/success", // Placeholders for now
                "https://example.com/cancel",
                saga.identity.idempotencyKey // Pass idempotency key
              );
              saga.payload.checkoutUrl = url;
            }
          } else {
            // Default explicit external boundary stand-in if provider not configured in DI
            saga.payload.checkoutUrl = `https://mock.gateway/pay/${saga.identity.checkoutId}`;
          }
          saga.version++;
          await this.store.save(saga);
          nextEvent = CheckoutEvent.PAYMENT_SUCCESS;
          break;
          
        case CheckoutEffect.FINALIZE_CHECKOUT:
          nextEvent = CheckoutEvent.FINALIZE;
          break;
          
        case CheckoutEffect.CANCEL_ORDER:
          if (saga.payload.orderReference) {
             await OrderCommandService.cancelOrder({
               orderId: saga.payload.orderReference,
               tenantId: saga.identity.tenantId,
               expectedVersion: 1, // Basic rollback assumption
               reason: "Saga Compensation",
               traceId: saga.identity.traceId
             });
          }
          CheckoutMetrics.increment("saga_compensations_total", 1, { effect: "CANCEL_ORDER", status: "SUCCESS" });
          nextEvent = CheckoutEvent.COMPENSATION_SUCCESS;
          break;
          
        case CheckoutEffect.RELEASE_INVENTORY:
          // Symmetric inverse of RESERVE_INVENTORY.
          // Called during saga compensation to release reserved stock back to the available pool.
          if (saga.payload.reservationReference) {
            for (const item of saga.payload.items) {
              await InventoryCommandService.releaseInventory({
                productId: item.productId,
                orderId: saga.identity.checkoutId,
                quantity: item.quantity,
                traceId: saga.identity.traceId
              });
            }
          }
          CheckoutMetrics.increment("saga_compensations_total", 1, { effect: "RELEASE_INVENTORY", status: "SUCCESS" });
          nextEvent = CheckoutEvent.COMPENSATION_SUCCESS;
          break;
          
        case CheckoutEffect.NONE:
          break;
      }
    } catch (error: any) {
      if (error.message === 'FATAL_CRASH') throw error; // Special bypass for test crashes
      
      let failureEvent: CheckoutEvent;
      switch (effect) {
        case CheckoutEffect.CALCULATE_PRICING:
          failureEvent = CheckoutEvent.PRICING_FAILURE;
          break;
        case CheckoutEffect.RESERVE_INVENTORY:
          failureEvent = CheckoutEvent.INVENTORY_FAILURE;
          break;
        case CheckoutEffect.CREATE_ORDER:
          failureEvent = CheckoutEvent.ORDER_FAILURE;
          break;
        case CheckoutEffect.AUTHORIZE_PAYMENT:
          failureEvent = CheckoutEvent.PAYMENT_FAILURE;
          break;
        case CheckoutEffect.CANCEL_ORDER:
        case CheckoutEffect.RELEASE_INVENTORY:
          CheckoutMetrics.increment("saga_compensations_total", 1, { effect: effect.toString(), status: "FAILED" });
          failureEvent = CheckoutEvent.COMPENSATION_FAILURE;
          break;
        default:
          throw error;
      }
      // Record the error before transitioning to failure state
      saga.lastError = error.message;
      saga.version++;
      await this.store.save(saga);
      nextEvent = failureEvent;
    }

    if (nextEvent) {
      await this.processEvent(saga.identity.checkoutId, nextEvent);
    }
  }

  public async resume(saga: CheckoutSagaInstance): Promise<void> {
    CheckoutMetrics.increment("saga_resumptions_total", 1, { tenantId: saga.identity.tenantId });
    let pendingEffect = CheckoutEffect.NONE;

    switch (saga.currentState) {
      case CheckoutState.INITIALIZED:
        pendingEffect = CheckoutEffect.CALCULATE_PRICING;
        break;
      case CheckoutState.PRICING_CALCULATED:
        pendingEffect = CheckoutEffect.RESERVE_INVENTORY;
        break;
      case CheckoutState.INVENTORY_RESERVED:
        pendingEffect = CheckoutEffect.CREATE_ORDER;
        break;
      case CheckoutState.ORDER_CREATED:
        pendingEffect = CheckoutEffect.AUTHORIZE_PAYMENT;
        break;
      case CheckoutState.PAYMENT_AUTHORIZED:
        pendingEffect = CheckoutEffect.FINALIZE_CHECKOUT;
        break;
      case CheckoutState.COMPENSATING:
        if (saga.orderCreated) pendingEffect = CheckoutEffect.CANCEL_ORDER;
        else if (saga.inventoryReserved) pendingEffect = CheckoutEffect.RELEASE_INVENTORY;
        else pendingEffect = CheckoutEffect.NONE;
        
        if (pendingEffect === CheckoutEffect.NONE) {
          await this.processEvent(saga.identity.checkoutId, CheckoutEvent.COMPENSATION_SUCCESS);
          return;
        }
        break;
    }

    if (pendingEffect !== CheckoutEffect.NONE) {
      await this.executeEffect(saga, pendingEffect);
    }
  }
}
