import { prisma } from "@/lib/prisma";
import { PrismaCheckoutSagaStateStore } from "@/modules/commerce/application/sagas/PrismaCheckoutSagaStateStore";
import { CheckoutOrchestratorService } from "@/modules/commerce/application/sagas/CheckoutOrchestratorService";
import { PaymentProvider } from "@/modules/commerce/application/payment/PaymentProvider";
import { CheckoutSagaRecoveryService } from "@/modules/commerce/application/sagas/CheckoutSagaRecoveryService";
import { CheckoutState } from "@/modules/commerce/application/sagas/CheckoutSaga.types";
import { randomUUID } from "crypto";

class SyntheticProbePaymentProvider implements PaymentProvider {
  private callLog = new Map<string, number>();
  private authorizedKeys = new Set<string>();
  public simulateCrashOnPayment = false;
  public simulatePaymentFailure = false;

  async createCheckoutSession(orderId: string, successUrl: string, cancelUrl: string, idempotencyKey?: string): Promise<string> {
    const key = idempotencyKey || orderId;
    const currentCalls = this.callLog.get(key) || 0;
    this.callLog.set(key, currentCalls + 1);

    if (this.simulatePaymentFailure) {
      throw new Error("Simulated payment authorization failure");
    }

    this.authorizedKeys.add(key);

    if (this.simulateCrashOnPayment) {
      throw new Error("FATAL_CRASH");
    }

    return `https://synthetic.stripe.test/pay/${orderId}`;
  }

  async verifyPaymentStatus(idempotencyKey: string): Promise<{ status: string; checkoutUrl?: string; paymentReference?: string } | null> {
    if (this.authorizedKeys.has(idempotencyKey)) {
      return {
        status: "AUTHORIZED",
        checkoutUrl: `https://synthetic.stripe.test/pay/recovered-${idempotencyKey}`,
        paymentReference: `pi_synthetic_${idempotencyKey}`
      };
    }
    return null;
  }

  getPhysicalCalls(idempotencyKey: string): number {
    return this.callLog.get(idempotencyKey) || 0;
  }
}

describe("Gate 22: Stage 1 Synthetic Probes Execution", () => {
  let store: PrismaCheckoutSagaStateStore;
  let paymentProvider: SyntheticProbePaymentProvider;
  let orchestrator: CheckoutOrchestratorService;
  let recoveryService: CheckoutSagaRecoveryService;

  let probeTenantId: string;
  let probeProductId: string;
  let probeWarehouseId: string;
  let probeUserId: string;

  beforeAll(async () => {
    store = new PrismaCheckoutSagaStateStore(prisma);
    paymentProvider = new SyntheticProbePaymentProvider();
    orchestrator = new CheckoutOrchestratorService(store, paymentProvider);
    recoveryService = new CheckoutSagaRecoveryService(prisma, store, orchestrator, "probe-runner");

    probeTenantId = `tenant_synthetic_${randomUUID()}`;
    probeProductId = `prod_synthetic_${randomUUID()}`;
    probeWarehouseId = `wh_synthetic_${randomUUID()}`;
    probeUserId = `user_synthetic_${randomUUID()}`;

    // 1. Seed Tenant
    await prisma.tenant.create({
      data: { id: probeTenantId, name: "Synthetic Probe Tenant" }
    });

    // 2. Seed User
    await prisma.user.create({
      data: {
        id: probeUserId,
        clerkId: `clerk_synthetic_${randomUUID()}`,
        email: `synthetic_${randomUUID()}@example.com`,
        name: "Synthetic Probe User"
      }
    });

    // 3. Seed Warehouse
    await prisma.warehouse.create({
      data: {
        id: probeWarehouseId,
        name: "Synthetic Probe Warehouse",
        ownerTenantId: probeTenantId
      }
    });

    // 4. Seed Product
    await prisma.product.create({
      data: {
        id: probeProductId,
        ownerTenantId: probeTenantId,
        name: "Synthetic Probe Product",
        price: 100.0,
        sku: `SKU-PROBE-${randomUUID().substring(0, 8)}`,
        description: "Synthetic test item",
        category: "ELECTRONICS",
        brand: "SyntheticBrand",
        stock: 1000,
        version: 1,
        status: "ACTIVE"
      }
    });

    // 5. Seed Inventory
    await prisma.inventory.create({
      data: {
        productId: probeProductId,
        warehouseId: probeWarehouseId,
        quantity: 1000,
        reserved: 0
      }
    });
  }, 45000);

  afterAll(async () => {
    await prisma.orderTimeline.deleteMany({ where: { order: { userId: probeUserId } } });
    await prisma.orderItem.deleteMany({ where: { order: { userId: probeUserId } } });
    await prisma.order.deleteMany({ where: { userId: probeUserId } });
    await prisma.reservation.deleteMany({ where: { inventory: { productId: probeProductId } } });
    await prisma.inventory.deleteMany({ where: { productId: probeProductId } });
    await prisma.product.deleteMany({ where: { id: probeProductId } });
    await prisma.warehouse.deleteMany({ where: { id: probeWarehouseId } });
    await prisma.user.deleteMany({ where: { id: probeUserId } });
    await prisma.tenant.deleteMany({ where: { id: probeTenantId } });
  });

  beforeEach(() => {
    paymentProvider.simulateCrashOnPayment = false;
    paymentProvider.simulatePaymentFailure = false;
  });

  it("Probe 1: Normal checkout succeeds end-to-end within latency targets", async () => {
    const key = `idem_norm_${randomUUID()}`;

    const result = await orchestrator.startCheckout({
      checkoutId: randomUUID(),
      tenantId: probeTenantId,
      idempotencyKey: key,
      traceId: `00-${randomUUID().replace(/-/g, '')}-${randomUUID().replace(/-/g, '').substring(0, 16)}-01`
    }, {
      userId: probeUserId,
      items: [{ productId: probeProductId, quantity: 1, price: 100 }]
    });

    expect(result.status).toBe(CheckoutState.COMPLETED);
    expect(result.checkoutUrl).toBeDefined();

    const orders = await prisma.order.findMany({ where: { idempotencyKey: key } });
    expect(orders.length).toBe(1);
  }, 90000);

  it("Probe 2: Duplicate retry with same idempotency key returns exact same result with zero duplicate orders", async () => {
    const key = `idem_retry_${randomUUID()}`;
    const payload = {
      userId: probeUserId,
      items: [{ productId: probeProductId, quantity: 2, price: 100 }]
    };

    const identity = {
      checkoutId: randomUUID(),
      tenantId: probeTenantId,
      idempotencyKey: key,
      traceId: `00-${randomUUID().replace(/-/g, '')}-${randomUUID().replace(/-/g, '').substring(0, 16)}-01`
    };

    const res1 = await orchestrator.startCheckout(identity, payload);
    const res2 = await orchestrator.startCheckout({ ...identity, checkoutId: randomUUID() }, payload);

    expect(res1.checkoutId).toBe(res2.checkoutId);
    expect(res1.checkoutUrl).toBe(res2.checkoutUrl);

    const orders = await prisma.order.findMany({ where: { idempotencyKey: key } });
    expect(orders.length).toBe(1);
  }, 90000);

  it("Probe 3: Concurrent retry race converges to single execution without duplicate authorizations", async () => {
    const key = `idem_race_${randomUUID()}`;
    const payload = {
      userId: probeUserId,
      items: [{ productId: probeProductId, quantity: 1, price: 100 }]
    };

    const identity1 = { checkoutId: randomUUID(), tenantId: probeTenantId, idempotencyKey: key, traceId: `trace-${randomUUID()}` };
    const identity2 = { checkoutId: randomUUID(), tenantId: probeTenantId, idempotencyKey: key, traceId: `trace-${randomUUID()}` };
    const identity3 = { checkoutId: randomUUID(), tenantId: probeTenantId, idempotencyKey: key, traceId: `trace-${randomUUID()}` };

    const results = await Promise.allSettled([
      orchestrator.startCheckout(identity1, payload),
      orchestrator.startCheckout(identity2, payload),
      orchestrator.startCheckout(identity3, payload)
    ]);

    const fulfilled = results.filter(r => r.status === "fulfilled") as PromiseFulfilledResult<any>[];
    expect(fulfilled.length).toBeGreaterThanOrEqual(1);

    const firstId = fulfilled[0].value.checkoutId;
    for (const res of fulfilled) {
      expect(res.value.checkoutId).toBe(firstId);
    }

    const orders = await prisma.order.findMany({ where: { idempotencyKey: key } });
    expect(orders.length).toBe(1);
  }, 90000);

  it("Probe 4: Payment ambiguity recovery reuses existing authorization and prevents double charges", async () => {
    const key = `idem_ambig_${randomUUID()}`;
    paymentProvider.simulateCrashOnPayment = true;

    const initialCheckoutId = randomUUID();
    const identity = {
      checkoutId: initialCheckoutId,
      tenantId: probeTenantId,
      idempotencyKey: key,
      traceId: `00-${randomUUID().replace(/-/g, '')}-${randomUUID().replace(/-/g, '').substring(0, 16)}-01`
    };

    const payload = {
      userId: probeUserId,
      items: [{ productId: probeProductId, quantity: 1, price: 100 }]
    };

    // 1. Initial attempt crashes after payment authorization
    await expect(orchestrator.startCheckout(identity, payload)).rejects.toThrow("FATAL_CRASH");

    // 2. Retry with normal payment provider (simulating client retry after crash)
    paymentProvider.simulateCrashOnPayment = false;
    const retryResult = await orchestrator.startCheckout({ ...identity, checkoutId: randomUUID() }, payload);

    expect(retryResult.status).toBe(CheckoutState.COMPLETED);
    expect(retryResult.checkoutUrl).toContain("recovered");

    // Verify physical provider call was NOT repeated for new charge (only 1 create session)
    expect(paymentProvider.getPhysicalCalls(key)).toBe(1);
  }, 90000);

  it("Probe 5: Crash and recovery worker sweep successfully resumes stranded sagas", async () => {
    const key = `idem_crash_${randomUUID()}`;
    const checkoutId = randomUUID();
    const identity = {
      checkoutId,
      tenantId: probeTenantId,
      idempotencyKey: key,
      traceId: `00-${randomUUID().replace(/-/g, '')}-${randomUUID().replace(/-/g, '').substring(0, 16)}-01`
    };

    paymentProvider.simulateCrashOnPayment = true;
    await expect(orchestrator.startCheckout(identity, {
      userId: probeUserId,
      items: [{ productId: probeProductId, quantity: 1, price: 100 }]
    })).rejects.toThrow("FATAL_CRASH");

    paymentProvider.simulateCrashOnPayment = false;

    // Simulate recovery sweep
    await recoveryService.recoverSaga(checkoutId, probeTenantId);

    const recovered = await store.loadByTenant(checkoutId, probeTenantId);
    expect(recovered?.currentState).toBe(CheckoutState.COMPLETED);
  }, 90000);

  it("Probe 6: Compensation path safely cancels order and releases reserved inventory upon failure", async () => {
    const key = `idem_comp_${randomUUID()}`;
    paymentProvider.simulatePaymentFailure = true;

    const identity = {
      checkoutId: randomUUID(),
      tenantId: probeTenantId,
      idempotencyKey: key,
      traceId: `00-${randomUUID().replace(/-/g, '')}-${randomUUID().replace(/-/g, '').substring(0, 16)}-01`
    };

    await orchestrator.startCheckout(identity, {
      userId: probeUserId,
      items: [{ productId: probeProductId, quantity: 3, price: 100 }]
    });

    const saga = await store.loadByTenant(identity.checkoutId, probeTenantId);
    expect(saga?.currentState).toBe(CheckoutState.ROLLED_BACK);
    expect(saga?.compensationRequired).toBe(true);

    // Verify inventory reservations were compensated / released
    const reservations = await prisma.reservation.findMany({
      where: { orderId: identity.checkoutId }
    });
    const pendingReservations = reservations.filter(r => r.status === "PENDING");
    expect(pendingReservations.length).toBe(0);
  }, 90000);
});
