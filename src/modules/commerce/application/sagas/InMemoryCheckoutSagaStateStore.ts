import { CheckoutSagaInstance } from "./CheckoutSaga.types";
import { CheckoutSagaStateStore } from "./CheckoutSagaStateStore";

export class InMemoryCheckoutSagaStateStore implements CheckoutSagaStateStore {
  private store: Map<string, CheckoutSagaInstance> = new Map();

  async save(saga: CheckoutSagaInstance): Promise<void> {
    // Clone to prevent object mutation leaking outside the store
    const serialized = JSON.stringify(saga);
    this.store.set(saga.identity.checkoutId, JSON.parse(serialized));
  }

  async load(checkoutId: string): Promise<CheckoutSagaInstance | null> {
    const saga = this.store.get(checkoutId);
    return saga ? JSON.parse(JSON.stringify(saga)) : null;
  }

  async loadByTenantAndIdempotencyKey(tenantId: string, idempotencyKey: string): Promise<CheckoutSagaInstance | null> {
    for (const saga of this.store.values()) {
      if (saga.identity.tenantId === tenantId && saga.identity.idempotencyKey === idempotencyKey) {
        return JSON.parse(JSON.stringify(saga));
      }
    }
    return null;
  }
}
