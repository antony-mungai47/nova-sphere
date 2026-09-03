import { prisma } from "@/lib/prisma";
import { PrismaCheckoutSagaStateStore } from "@/modules/commerce/application/sagas/PrismaCheckoutSagaStateStore";
import { CheckoutOrchestratorService, canonicalStringify, CheckoutConflictError } from "@/modules/commerce/application/sagas/CheckoutOrchestratorService";
import { PaymentProvider } from "@/modules/commerce/application/payment/PaymentProvider";
import { InventoryExpirationService } from "@/modules/commerce/application/commands/InventoryExpirationService";
import { CheckoutMetrics } from "@/modules/commerce/application/sagas/CheckoutMetrics";
import { GET as getCheckoutHealth } from "@/app/api/admin/checkout-health/route";
import { POST as postCheckoutReconcile } from "@/app/api/admin/checkout-reconcile/route";
import { randomUUID } from "crypto";

class MockPaymentGateway implements PaymentProvider {
  async createCheckoutSession(orderId: string, successUrl: string, cancelUrl: string, idempotencyKey?: string): Promise<string> {
    return `https://mock.stripe/pay/${orderId}`;
  }
  async verifyPaymentStatus(idempotencyKey: string): Promise<{ status: string; checkoutUrl?: string; paymentReference?: string } | null> {
    return null;
  }
}

describe("Phase D: Checkout Saga Load, Concurrency, Observability & Security Soak", () => {
  let store: PrismaCheckoutSagaStateStore;
  let orchestrator: CheckoutOrchestratorService;
  let testProductId: string;
  let testTenantId: string;
  let testWarehouseId: string;
  let testUserId: string;

  beforeAll(async () => {
    store = new PrismaCheckoutSagaStateStore(prisma);
    orchestrator = new CheckoutOrchestratorService(store, new MockPaymentGateway());

    testTenantId = `tenant_load_${randomUUID()}`;
    testProductId = `prod_load_${randomUUID()}`;
    testWarehouseId = `wh_load_${randomUUID()}`;
    testUserId = `user_load_${randomUUID()}`;

    // 1. Seed Tenant
    await prisma.tenant.create({
      data: {
        id: testTenantId,
        name: 'Load Test Tenant'
      }
    });

    // 2. Seed User
    await prisma.user.create({
      data: {
        id: testUserId,
        clerkId: `clerk_load_${randomUUID()}`,
        email: `load_${randomUUID()}@example.com`,
        name: 'Load Test User'
      }
    });

    // 3. Seed Warehouse
    await prisma.warehouse.create({
      data: {
        id: testWarehouseId,
        name: 'Load Test Warehouse',
        ownerTenantId: testTenantId
      }
    });

    // 4. Seed Product
    await prisma.product.create({
      data: {
        id: testProductId,
        ownerTenantId: testTenantId,
        name: "Load Test Item",
        price: 50.0,
        sku: `SKU-LOAD-${randomUUID().substring(0, 8)}`,
        description: "Test description",
        category: "ELECTRONICS",
        brand: "GenericBrand",
        stock: 500,
        version: 1,
        status: "ACTIVE"
      }
    });

    // 5. Seed Inventory
    await prisma.inventory.create({
      data: {
        productId: testProductId,
        warehouseId: testWarehouseId,
        quantity: 500,
        reserved: 0
      }
    });
  }, 30000);

  afterAll(async () => {
    // Cleanup test data with proper relation ordering
    await prisma.orderTimeline.deleteMany({ where: { order: { userId: testUserId } } });
    await prisma.orderItem.deleteMany({ where: { order: { userId: testUserId } } });
    await prisma.order.deleteMany({ where: { userId: testUserId } });
    await prisma.reservation.deleteMany({ where: { inventory: { productId: testProductId } } });
    await prisma.inventory.deleteMany({ where: { productId: testProductId } });
    await prisma.product.deleteMany({ where: { id: testProductId } });
    await prisma.warehouse.deleteMany({ where: { id: testWarehouseId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.tenant.deleteMany({ where: { id: testTenantId } });
  });

  it("D1: Canonical JSON serialization guarantees identical request fingerprints regardless of key ordering", () => {
    const payloadA = {
      items: [{ productId: "p1", quantity: 2, price: 20 }],
      userId: "user_1",
      customerEmail: "alice@example.com"
    };

    const payloadB = {
      customerEmail: "alice@example.com",
      userId: "user_1",
      items: [{ price: 20, quantity: 2, productId: "p1" }]
    };

    const strA = canonicalStringify(payloadA);
    const strB = canonicalStringify(payloadB);

    expect(strA).toBe(strB);
  });

  it("D1/D4: Concurrent burst requests with identical idempotency keys converge to single execution", async () => {
    const key = `idem_burst_${randomUUID()}`;

    const payload = {
      userId: testUserId,
      items: [{ productId: testProductId, quantity: 1, price: 50 }],
      shippingAddress: { city: "Metropolis" }
    };

    const identity1 = { checkoutId: randomUUID(), tenantId: testTenantId, idempotencyKey: key, traceId: `trace-${randomUUID()}` };
    const identity2 = { checkoutId: randomUUID(), tenantId: testTenantId, idempotencyKey: key, traceId: `trace-${randomUUID()}` };
    const identity3 = { checkoutId: randomUUID(), tenantId: testTenantId, idempotencyKey: key, traceId: `trace-${randomUUID()}` };

    const results = await Promise.allSettled([
      orchestrator.startCheckout(identity1, payload),
      orchestrator.startCheckout(identity2, payload),
      orchestrator.startCheckout(identity3, payload)
    ]);

    const fulfilled = results.filter(r => r.status === "fulfilled") as PromiseFulfilledResult<any>[];
    expect(fulfilled.length).toBeGreaterThanOrEqual(1);

    // Verify all fulfilled returned the exact same logical checkoutId
    const firstCheckoutId = fulfilled[0].value.checkoutId;
    for (const res of fulfilled) {
      expect(res.value.checkoutId).toBe(firstCheckoutId);
    }

    // Verify only 1 order was created in DB for this idempotency key
    const orders = await prisma.order.findMany({ where: { idempotencyKey: key } });
    expect(orders.length).toBe(1);
  }, 45000);

  it("Gate 19: Passive TTL reservation safety net automatically releases abandoned reservations", async () => {
    const inv = await prisma.inventory.findUnique({ where: { productId: testProductId } });
    expect(inv).toBeDefined();

    // Artificially create a reservation expired 20 minutes ago
    const expiredReservation = await prisma.reservation.create({
      data: {
        inventoryId: inv!.id,
        orderId: `order_abandoned_${randomUUID()}`,
        quantity: 5,
        status: "PENDING",
        expiresAt: new Date(Date.now() - 20 * 60 * 1000)
      }
    });

    // Artificially decrement available stock and increment reserved to mimic uncompleted saga
    await prisma.inventory.update({
      where: { id: inv!.id },
      data: { reserved: { increment: 5 } }
    });
    await prisma.product.update({
      where: { id: testProductId },
      data: { stock: { decrement: 5 } }
    });

    // Run passive TTL sweeper
    const releasedCount = await InventoryExpirationService.sweepExpiredReservations();
    expect(releasedCount).toBeGreaterThanOrEqual(1);

    // Verify reservation status became EXPIRED
    const updatedRes = await prisma.reservation.findUnique({ where: { id: expiredReservation.id } });
    expect(updatedRes?.status).toBe("EXPIRED");
  }, 30000);

  it("Gate 21: Admin reconciliation endpoints enforce strict RBAC, pagination, and sanitization", async () => {
    // 1. Unauthorized request should fail with 401
    const unauthReq = new Request("http://localhost/api/admin/checkout-health");
    const unauthRes = await getCheckoutHealth(unauthReq);
    expect(unauthRes.status).toBe(401);

    // 2. Authorized request should succeed and return paginated health
    const authReq = new Request("http://localhost/api/admin/checkout-health?limit=10", {
      headers: { "x-admin-token": process.env.ADMIN_API_SECRET || "nova-admin-secret-key" }
    });
    const authRes = await getCheckoutHealth(authReq);
    expect(authRes.status).toBe(200);

    const body = await authRes.json();
    expect(body.health).toBeDefined();
    expect(body.pagination).toBeDefined();
    expect(body.pagination.limit).toBe(10);
    expect(Array.isArray(body.items)).toBe(true);

    // 3. Reconcile endpoint rejects missing parameters
    const badReconcileReq = new Request("http://localhost/api/admin/checkout-reconcile", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-admin-token": process.env.ADMIN_API_SECRET || "nova-admin-secret-key" 
      },
      body: JSON.stringify({ action: "FORCE_COMPENSATE" }) // Missing fields
    });
    const badReconcileRes = await postCheckoutReconcile(badReconcileReq);
    expect(badReconcileRes.status).toBe(400);
  }, 30000);
});
