import { PrismaClient } from "@prisma/client";
import { OrderCommandService } from "./OrderCommandService";
import { OrderCancelledSaga } from "../sagas/OrderCancelledSaga";
import { InventoryCommandService } from "./InventoryCommandService";
import { prisma } from "../../../../lib/prisma";

jest.setTimeout(30000);

describe("OrderCommandService Integration (U3B.3)", () => {
  let testUserId: string;
  let testWarehouseId: string;

  beforeAll(async () => {
    const user = await prisma.user.upsert({
      where: { clerkId: "test-clerk-id" },
      update: {},
      create: {
        email: "test-user-orders@example.com",
        name: "Test User",
        role: "CUSTOMER",
        clerkId: "test-clerk-id"
      }
    });
    testUserId = user.id;

    const warehouse = await prisma.warehouse.create({
      data: {
        name: `Test Warehouse ${Date.now()}`,
        location: "Test Location"
      }
    });
    testWarehouseId = warehouse.id;
  });

  afterAll(async () => {
    if (testWarehouseId) await prisma.warehouse.deleteMany({ where: { id: testWarehouseId } });
    if (testUserId) await prisma.user.deleteMany({ where: { id: testUserId } });
  });

  afterEach(async () => {
    await prisma.domainEventOutbox.deleteMany({});
    await prisma.orderTimeline.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.reservation.deleteMany({});
    await prisma.inventory.deleteMany({});
    await prisma.product.deleteMany({});
  });

  it("handles duplicate idempotency keys cleanly on creation", async () => {
    const cmd = {
      userId: testUserId,
      tenantId: "tenant-a",
      items: [],
      totalAmount: 100,
      subtotal: 100,
      tax: 0,
      shippingCost: 0,
      discount: 0,
      currency: "USD",
      idempotencyKey: "idem-order-1"
    };

    const order1 = await OrderCommandService.createOrder(cmd);
    const order2 = await OrderCommandService.createOrder(cmd);

    expect(order1.id).toEqual(order2.id);

    const count = await prisma.order.count({ where: { idempotencyKey: "idem-order-1" } });
    expect(count).toBe(1);
  });

  it("prevents completing an already cancelled order (State Machine Transition)", async () => {
    const order = await OrderCommandService.createOrder({
      userId: testUserId,
      tenantId: "tenant-a",
      items: [],
      totalAmount: 100,
      subtotal: 100,
      tax: 0,
      shippingCost: 0,
      discount: 0,
      currency: "USD"
    });

    // Cancel the order
    await OrderCommandService.cancelOrder({
      orderId: order.id,
      tenantId: "tenant-a",
      expectedVersion: 1
    });

    // Try to complete the cancelled order
    await expect(OrderCommandService.completeOrder({
      orderId: order.id,
      tenantId: "tenant-a",
      expectedVersion: 2
    })).rejects.toThrow(/Illegal state transition/);
  });

  it("safely resolves concurrent complete and cancel attempts via optimistic lock", async () => {
    const order = await OrderCommandService.createOrder({
      userId: testUserId,
      tenantId: "tenant-a",
      items: [],
      totalAmount: 100,
      subtotal: 100,
      tax: 0,
      shippingCost: 0,
      discount: 0,
      currency: "USD"
    });

    // Fire cancel and complete at the exact same expected version (1)
    const pCancel = OrderCommandService.cancelOrder({
      orderId: order.id,
      tenantId: "tenant-a",
      expectedVersion: 1
    }).catch(e => e);

    const pComplete = OrderCommandService.completeOrder({
      orderId: order.id,
      tenantId: "tenant-a",
      expectedVersion: 1
    }).catch(e => e);

    const [resCancel, resComplete] = await Promise.all([pCancel, pComplete]);

    const finalOrder = await prisma.order.findUnique({ where: { id: order.id } });
    
    // Exactly one should succeed
    const successes = [resCancel, resComplete].filter(r => r === true);
    const errors = [resCancel, resComplete].filter(r => r instanceof Error);

    expect(successes).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/ConcurrencyConflictException|Illegal state transition/);
    expect(finalOrder?.version).toBe(2); // exactly one bump
  });

  it("prevents cross-tenant access to orders (Gate 14)", async () => {
    const order = await OrderCommandService.createOrder({
      userId: testUserId,
      tenantId: "tenant-a",
      items: [],
      totalAmount: 100,
      subtotal: 100,
      tax: 0,
      shippingCost: 0,
      discount: 0,
      currency: "USD"
    });

    await expect(OrderCommandService.cancelOrder({
      orderId: order.id,
      tenantId: "tenant-b", // Attempt to cancel Tenant A's order from Tenant B
      expectedVersion: 1
    })).rejects.toThrow(/Order not found or tenant mismatch/);
  });

  it("transactional outbox publishes events ONLY on commit", async () => {
    const order = await OrderCommandService.createOrder({
      userId: testUserId,
      tenantId: "tenant-a",
      items: [],
      totalAmount: 100,
      subtotal: 100,
      tax: 0,
      shippingCost: 0,
      discount: 0,
      currency: "USD"
    });

    // Try a cancel that rolls back
    try {
      await prisma.$transaction(async (tx) => {
        await OrderCommandService.cancelOrder({
          orderId: order.id,
          tenantId: "tenant-a",
          expectedVersion: 1
        }, tx);
        throw new Error("Simulated Rollback Error");
      });
    } catch (e) {}

    const outboxEvents = await prisma.domainEventOutbox.findMany({
      where: { aggregateId: order.id, eventType: "order.cancelled" }
    });
    
    // No outbox event should exist because it rolled back
    expect(outboxEvents).toHaveLength(0);

    // Now do a successful cancel
    await OrderCommandService.cancelOrder({
      orderId: order.id,
      tenantId: "tenant-a",
      expectedVersion: 1
    });

    const outboxEventsAfter = await prisma.domainEventOutbox.findMany({
      where: { aggregateId: order.id, eventType: "order.cancelled" }
    });
    
    // Exactly 1 outbox event should exist
    expect(outboxEventsAfter).toHaveLength(1);
  });

  it("compensation saga is idempotent (Duplicate event delivery)", async () => {
    // Create a product
    const product = await prisma.product.create({
      data: {
        name: "Test Prod",
        description: "Test description",
        category: "Test category",
        brand: "Test brand",
        sku: "TEST-SKU",
        price: 100,
        stock: 10,
        version: 1
      }
    });

    await prisma.inventory.create({
      data: {
        productId: product.id,
        warehouseId: testWarehouseId,
        quantity: 10,
        reserved: 0
      }
    });

    // Create an order mapped to it
    const order = await OrderCommandService.createOrder({
      userId: testUserId,
      tenantId: "tenant-a",
      items: [{ productId: product.id, quantity: 2, price: 100 }],
      totalAmount: 200,
      subtotal: 200,
      tax: 0,
      shippingCost: 0,
      discount: 0,
      currency: "USD"
    });

    // Manually reserve inventory so releaseInventory can be idempotent
    await InventoryCommandService.reserveInventory({
      productId: product.id,
      orderId: order.id,
      quantity: 2,
      traceId: "test-trace"
    });

    // Simulate calling the saga twice for the same event
    await OrderCancelledSaga.handle({ orderId: order.id, tenantId: "tenant-a" });
    await OrderCancelledSaga.handle({ orderId: order.id, tenantId: "tenant-a" });

    // Verify stock is restored by exactly 2 (to 10 total)
    const p = await prisma.product.findUnique({ where: { id: product.id } });
    expect(p?.stock).toBe(10);
  });
});
