import { CheckoutSagaInstance } from "./CheckoutSaga.types";

export class DuplicateIdempotencyKeyError extends Error {
  constructor(public readonly tenantId: string, public readonly idempotencyKey: string) {
    super(`Duplicate idempotency key '${idempotencyKey}' for tenant '${tenantId}'`);
    this.name = "DuplicateIdempotencyKeyError";
  }
}

export interface CheckoutSagaStateStore {
  save(saga: CheckoutSagaInstance): Promise<void>;
  load(checkoutId: string): Promise<CheckoutSagaInstance | null>;
  loadByTenantAndIdempotencyKey(tenantId: string, idempotencyKey: string): Promise<CheckoutSagaInstance | null>;
}
