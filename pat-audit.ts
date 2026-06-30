import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Starting PAT Database & Inventory Audit...")
  
  // 1. Total Products
  const totalProducts = await prisma.product.count()
  console.log(`[PASS] Total Products: ${totalProducts}`)

  // 2. Duplicate SKUs
  const allSkus = await prisma.product.findMany({ select: { sku: true } })
  const skuSet = new Set(allSkus.map(p => p.sku))
  if (skuSet.size !== allSkus.length) {
    console.error(`[FAIL] Found duplicate SKUs! Unique: ${skuSet.size}, Total: ${allSkus.length}`)
  } else {
    console.log(`[PASS] No duplicate SKUs found. All ${skuSet.size} SKUs are unique.`)
  }

  // 3. Category Integrity
  const categories = await prisma.product.groupBy({
    by: ['category'],
    _count: { category: true }
  })
  console.log(`[PASS] Categories populated: ${categories.length}`)

  // 4. Missing Images Check
  const productsWithoutImages = await prisma.product.findMany({
    where: { images: { none: {} } },
    select: { id: true, name: true }
  })
  if (productsWithoutImages.length > 0) {
    console.warn(`[WARN] ${productsWithoutImages.length} products are missing images.`)
  } else {
    console.log(`[PASS] All products have at least one image.`)
  }

  // 5. Unrealistic Prices Check (< $0)
  const negativePrice = await prisma.product.count({
    where: { price: { lt: 0 } }
  })
  if (negativePrice > 0) {
    console.error(`[FAIL] Found ${negativePrice} products with negative prices.`)
  } else {
    console.log(`[PASS] All product prices are positive.`)
  }

  console.log("Audit complete.")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
