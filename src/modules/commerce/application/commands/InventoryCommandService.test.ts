import { InventoryCommandService } from "./InventoryCommandService";
import { ProductStockRepository } from "../../infrastructure/repositories/ProductStockRepository";
import { InventoryRepository } from "../../infrastructure/repositories/InventoryRepository";
import { prisma } from "@/lib/prisma";

describe("InventoryCommandService Integration (U3B.1)", () => {
  let testProductId: string;
  let testInventoryId: string;
  const initialStock = 100;

  let testWarehouseName: string;

  beforeAll(async () => {
    testWarehouseName = `Test Warehouse-${Date.now()}`;
    // Setup test product and inventory
    const p = await prisma.product.create({
      data: {
        name: "Test Inventory Product",
        description: "Test",
        price: 10,
        sku: `TEST-SKU-${Date.now()}`,
        category: "Test",
        brand: "Test",
        stock: initialStock
      }
    });
    testProductId = p.id;

    const w = await prisma.warehouse.create({
      data: { name: testWarehouseName }
    });

    const i = await prisma.inventory.create({
      data: {
        productId: testProductId,
        warehouseId: w.id,
        quantity: initialStock
      }
    });
    testInventoryId = i.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.reservation.deleteMany({ where: { inventoryId: testInventoryId } });
    await prisma.inventory.delete({ where: { id: testInventoryId } });
    await prisma.product.delete({ where: { id: testProductId } });
    await prisma.warehouse.deleteMany({ where: { name: testWarehouseName } });
  });

  it("Double retry (idempotency) should produce exactly one reservation", async () => {
    const orderId = `order-idempotent-${Date.now()}`;
    const traceId = `trace-${Date.now()}`;

    // First try
    await InventoryCommandService.reserveInventory({
      productId: testProductId,
      orderId,
      quantity: 5,
      traceId
    });

    // Second retry with same orderId
    await InventoryCommandService.reserveInventory({
      productId: testProductId,
      orderId,
      quantity: 5,
      traceId
    });

    const reservations = await prisma.reservation.findMany({
      where: { orderId }
    });

    // Should only have 1 reservation despite 2 calls
    expect(reservations.length).toBe(1);
    expect(reservations[0].quantity).toBe(5);

    // Stock should be decremented by 5 only once
    const { availableStock } = await ProductStockRepository.getStock(testProductId);
    expect(availableStock).toBe(initialStock - 5);
  });

  it("Concurrent reservations should never oversell", async () => {
    const p2 = await prisma.product.create({
      data: {
        name: "Oversell Test",
        description: "Test",
        price: 10,
        sku: `TEST-SKU-OVERSELL-${Date.now()}`,
        category: "Test",
        brand: "Test",
        stock: 10 // only 10 available
      }
    });

    const w = await prisma.warehouse.findFirst({ where: { name: testWarehouseName } });
    await prisma.inventory.create({
      data: {
        productId: p2.id,
        warehouseId: w!.id,
        quantity: 10
      }
    });

    const traceId = `trace-${Date.now()}`;
    const requests = Array.from({ length: 5 }).map((_, i) => {
      return InventoryCommandService.reserveInventory({
        productId: p2.id,
        orderId: `order-oversell-${i}`,
        quantity: 3, // 5 requests * 3 = 15 total requested (only 10 available)
        traceId
      });
    });

    const results = await Promise.allSettled(requests);
    const successes = results.filter(r => r.status === "fulfilled");
    const failures = results.filter(r => r.status === "rejected");

    // Only 3 should succeed (3 * 3 = 9 stock reserved)
    // 4th request needs 3 but only 1 left -> fails
    expect(successes.length).toBe(3);
    expect(failures.length).toBe(2);

    const finalStock = await ProductStockRepository.getStock(p2.id);
    expect(finalStock.availableStock).toBe(1); // 10 - 9 = 1

    // Cleanup
    await prisma.reservation.deleteMany({ where: { inventory: { productId: p2.id } } });
    await prisma.inventory.delete({ where: { productId: p2.id } });
    await prisma.product.delete({ where: { id: p2.id } });
  });

  it("Compensation restores stock and resolves successfully (golden failure path)", async () => {
    const traceId = `trace-comp-${Date.now()}`;
    const orderId = `order-fail-${Date.now()}`;

    // 1. Reserve
    await InventoryCommandService.reserveInventory({
      productId: testProductId,
      orderId,
      quantity: 15,
      traceId
    });

    const afterReserve = await ProductStockRepository.getStock(testProductId);
    // Stock decreased by 15
    const originalAvailable = initialStock - 5; // minus 5 from previous test
    expect(afterReserve.availableStock).toBe(originalAvailable - 15);

    // 2. Commit fails (simulated by caller catching error and issuing Release)
    // We execute ReleaseInventoryCommand as compensation
    await InventoryCommandService.releaseInventory({
      productId: testProductId,
      orderId,
      quantity: 15,
      traceId
    });

    // 3. Verify exactly restored
    const afterRelease = await ProductStockRepository.getStock(testProductId);
    expect(afterRelease.availableStock).toBe(originalAvailable);

    // Verify reservation is released
    const reservation = await prisma.reservation.findFirst({
      where: { orderId }
    });
    expect(reservation?.status).toBe("RELEASED");
  });
});
