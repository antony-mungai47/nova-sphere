import { PrismaClient, ProductStatus, OrderStatus, AuctionStatus, LogLevel } from "@prisma/client";

const prisma = new PrismaClient();

async function runValidation() {
  console.log("Validating Database Integrity...");
  try {
    // 1. Product (Decimal + Enum + Json + Soft Delete)
    const product = await prisma.product.create({
      data: {
        name: "Test Validation Product",
        sku: "TEST-VALIDATION-SKU-001",
        description: "Test description",
        price: 99.99,
        category: "Test",
        brand: "TestBrand",
        status: ProductStatus.ACTIVE,
        specs: { "color": "red" },
        features: ["test1", "test2"]
      }
    });
    console.log("✅ Created Product:", product.id);

    // Update Product (Soft Delete)
    await prisma.product.update({
      where: { id: product.id },
      data: {
        status: ProductStatus.ARCHIVED,
        deletedAt: new Date(),
        deleteReason: "Testing soft delete"
      }
    });
    console.log("✅ Soft-Deleted Product");

    const user = await prisma.user.findFirst();
    if (!user) throw new Error("No user found to test with");

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: 150.50,
        subtotal: 130.00,
        tax: 10.50,
        shippingCost: 10.00,
        discount: 0,
        currency: "USD",
        status: OrderStatus.PENDING,
      }
    });
    console.log("✅ Created Order:", order.id);

    // 3. SystemLog (Enum + Json)
    const log = await prisma.systemLog.create({
      data: {
        source: "TEST_CRUD",
        message: "Validating CRUD operations",
        level: LogLevel.INFO,
        metadata: { "test": "success" }
      }
    });
    console.log("✅ Created SystemLog:", log.id);

    console.log("✅ All validations passed!");
  } catch (error) {
    console.error("❌ Validation failed:", error);
    process.exit(1);
  } finally {
    // Clean up
    await prisma.product.deleteMany({ where: { sku: "TEST-VALIDATION-SKU-001" } });
    await prisma.order.deleteMany({ where: { userId: "test-user-id" } });
    await prisma.systemLog.deleteMany({ where: { source: "TEST_CRUD" } });
    await prisma.$disconnect();
  }
}

runValidation();
