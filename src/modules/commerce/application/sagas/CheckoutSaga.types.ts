export interface CheckoutIdentity {
  checkoutId: string;
  tenantId: string;
  traceId: string;
  idempotencyKey: string;
}

export interface CheckoutItemInput {
  productId: string;
  quantity: number;
  price?: number; 
}

import { PricingCalculationDTO as DomainPricingCalculationDTO } from "../../domain/pricing/types";

export type PricingCalculationDTO = DomainPricingCalculationDTO;

export interface CheckoutSagaPayload {
  items: CheckoutItemInput[];
  userId: string;
  clientTotal?: number;
  pricingSnapshot?: PricingCalculationDTO;
  reservationReference?: string;
  orderReference?: string;
  paymentReference?: string;
  checkoutUrl?: string;
}

export interface CheckoutResultDTO {
  checkoutId: string;
  status: string;
  checkoutUrl?: string;
  orderId?: string;
}

export enum CheckoutState {
  INITIALIZED = "INITIALIZED",
  PRICING_CALCULATED = "PRICING_CALCULATED",
  INVENTORY_RESERVED = "INVENTORY_RESERVED",
  ORDER_CREATED = "ORDER_CREATED",
  PAYMENT_AUTHORIZED = "PAYMENT_AUTHORIZED",
  COMPLETED = "COMPLETED",
  COMPENSATING = "COMPENSATING",
  ROLLED_BACK = "ROLLED_BACK",
  FAILED = "FAILED" // Terminal failure without successful rollback
}

export enum CheckoutEvent {
  START = "START",
  PRICING_SUCCESS = "PRICING_SUCCESS",
  PRICING_FAILURE = "PRICING_FAILURE",
  INVENTORY_SUCCESS = "INVENTORY_SUCCESS",
  INVENTORY_FAILURE = "INVENTORY_FAILURE",
  ORDER_SUCCESS = "ORDER_SUCCESS",
  ORDER_FAILURE = "ORDER_FAILURE",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  PAYMENT_FAILURE = "PAYMENT_FAILURE",
  COMPENSATION_SUCCESS = "COMPENSATION_SUCCESS",
  COMPENSATION_FAILURE = "COMPENSATION_FAILURE",
  FINALIZE = "FINALIZE"
}

export enum CheckoutEffect {
  CALCULATE_PRICING = "CALCULATE_PRICING",
  RESERVE_INVENTORY = "RESERVE_INVENTORY",
  CREATE_ORDER = "CREATE_ORDER",
  AUTHORIZE_PAYMENT = "AUTHORIZE_PAYMENT",
  FINALIZE_CHECKOUT = "FINALIZE_CHECKOUT",
  RELEASE_INVENTORY = "RELEASE_INVENTORY",
  CANCEL_ORDER = "CANCEL_ORDER",
  NONE = "NONE"
}

export interface TransitionHistoryRecord {
  checkoutId: string;
  previousState: CheckoutState | null;
  currentState: CheckoutState;
  event: CheckoutEvent;
  transitionId: string;
  timestamp: Date;
  step: number;
  attempt: number;
  effect: CheckoutEffect;
}

export interface CheckoutSagaInstance {
  identity: CheckoutIdentity;
  currentState: CheckoutState;
  
  // Explicit Execution Record
  pricingCompleted: boolean;
  inventoryReserved: boolean;
  orderCreated: boolean;
  paymentAuthorized: boolean;
  compensationRequired: boolean;

  lastEvent: CheckoutEvent | null;
  lastError: string | null;
  
  version: number;

  payload?: CheckoutSagaPayload;

  history: TransitionHistoryRecord[];
  completedEffects: CheckoutEffect[]; // Keep for testing/metrics, but recovery relies on flags above
  recoveryOwner?: string | null;
  recoveryLeaseUntil?: Date | null;
  requestFingerprint?: string;
}

export interface StateMachineResult {
  nextState: CheckoutState;
  effect: CheckoutEffect;
}
