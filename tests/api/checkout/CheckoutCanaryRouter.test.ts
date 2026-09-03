import { prisma } from "@/lib/prisma";
import { PrismaCheckoutSagaStateStore } from "@/modules/commerce/application/sagas/PrismaCheckoutSagaStateStore";
import { CheckoutCanaryRouter } from "@/modules/commerce/application/routing/CheckoutCanaryRouter";
import { CheckoutState } from "@/modules/commerce/application/sagas/CheckoutSaga.types";
import { randomUUID } from "crypto";

describe("Gate 22: Canary Router & Saga Pinning Invariant", () => {
  let store: PrismaCheckoutSagaStateStore;
  const originalEnv = process.env;

  beforeAll(() => {
    jest.setTimeout(30000);
    store = new PrismaCheckoutSagaStateStore(prisma);
  });

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("Invariant 1: Existing saga records remain PINNED to Saga orchestrator even during traffic rollback", async () => {
    const tenantId = `tenant_pin_${randomUUID()}`;
    const key = `key_pin_${randomUUID()}`;
    const checkoutId = randomUUID();

    // 1. Artificially create a saga record in DB
    await prisma.checkoutSagaState.create({
      data: {
        checkoutId,
        tenantId,
        idempotencyKey: key,
        traceId: `00-${randomUUID().replace(/-/g, '')}-${randomUUID().replace(/-/g, '').substring(0, 16)}-01`,
        currentState: "INITIALIZED",
        pricingCompleted: false,
        inventoryReserved: false,
        orderCreated: false,
        paymentAuthorized: false,
        compensationRequired: false,
        version: 1
      }
    });

    // 2. Simulate global rollback (kill switch active)
    process.env.CHECKOUT_SAGA_ENABLED = "false";
    process.env.CHECKOUT_SAGA_CANARY_PERCENTAGE = "0";

    const decision = await CheckoutCanaryRouter.evaluateRouting(tenantId, key, store);
    expect(decision.routeToSaga).toBe(true);
    expect(decision.isPinned).toBe(true);
    expect(decision.reason).toBe("PINNED_EXISTING_SAGA");

    // Cleanup
    await prisma.checkoutSagaState.delete({ where: { checkoutId } });
  });

  it("Kill Switch: Unpinned new checkout requests route to legacy path when disabled", async () => {
    const tenantId = `tenant_new_${randomUUID()}`;
    const key = `key_new_${randomUUID()}`;

    process.env.CHECKOUT_SAGA_ENABLED = "false";

    const decision = await CheckoutCanaryRouter.evaluateRouting(tenantId, key, store);
    expect(decision.routeToSaga).toBe(false);
    expect(decision.isPinned).toBe(false);
    expect(decision.reason).toBe("DISABLED_KILL_SWITCH");
  });

  it("Stage 2 Allowlisting: Opt-in beta tenants route to Saga when listed", async () => {
    const betaTenant = "tenant_beta_store_1";
    const nonBetaTenant = "tenant_standard_99";
    const key = `key_beta_${randomUUID()}`;

    process.env.CHECKOUT_SAGA_ENABLED = "true";
    process.env.CHECKOUT_SAGA_CANARY_PERCENTAGE = "0";
    process.env.CHECKOUT_SAGA_ALLOWED_TENANTS = "tenant_beta_store_1,tenant_internal_2";

    const decisionBeta = await CheckoutCanaryRouter.evaluateRouting(betaTenant, key, store);
    expect(decisionBeta.routeToSaga).toBe(true);
    expect(decisionBeta.reason).toBe("TENANT_ALLOWLISTED");

    const decisionNonBeta = await CheckoutCanaryRouter.evaluateRouting(nonBetaTenant, key, store);
    expect(decisionNonBeta.routeToSaga).toBe(false);
  });
});
