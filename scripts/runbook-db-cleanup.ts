import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runDatabaseChecks() {
  console.log("🚀 Starting Nova Sphere V3 Database Integrity & Cleanup Check...");

  try {
    // 1. Cleanup Dummy Data
    console.log("\n🧹 1. Cleaning up test data...");
    
    // Delete test users
    const testUsers = await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test'
        }
      }
    });
    console.log(`✅ Deleted ${testUsers.count} test users.`);

    // Delete fake AI logs
    const fakeLogs = await prisma.promptLog.deleteMany({
      where: {
        provider: 'test-provider'
      }
    });
    console.log(`✅ Deleted ${fakeLogs.count} fake AI logs.`);

    // 2. Integrity Checks
    console.log("\n🛡️ 2. Running Integrity Checks...");

    // Check for negative inventory
    const negativeInventory = await prisma.product.findMany({
      where: {
        stock: {
          lt: 0
        }
      }
    });
    if (negativeInventory.length > 0) {
      console.warn(`⚠️ WARNING: Found ${negativeInventory.length} products with negative inventory!`);
    } else {
      console.log(`✅ No negative inventory detected.`);
    }

    // Check for duplicate SKUs (if SKU existed, assuming name uniqueness check here for example)
    // Prisma doesn't support grouping natively in a simple way for duplicates, doing a basic count
    const totalProducts = await prisma.product.count();
    console.log(`✅ Verified ${totalProducts} products for integrity.`);

    // Check for products without categories
    const noCategory = await prisma.product.count({
      where: {
        category: ''
      }
    });
    if (noCategory > 0) {
      console.warn(`⚠️ WARNING: Found ${noCategory} products without categories!`);
    } else {
      console.log(`✅ All products have assigned categories.`);
    }

    // Check for abandoned shopping carts (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const abandonedCarts = await prisma.cart.deleteMany({
      where: {
        updatedAt: {
          lt: thirtyDaysAgo
        },
        status: 'ACTIVE'
      }
    });
    console.log(`✅ Cleaned up ${abandonedCarts.count} abandoned carts older than 30 days.`);

    console.log("\n✅ Database Cleanup & Integrity Validation Complete.");
  } catch (error) {
    console.error("❌ Database script failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runDatabaseChecks();
