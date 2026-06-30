import { prisma } from './src/lib/prisma';

async function auditCatalog() {
  console.log("==========================================");
  console.log("MILESTONE 1: DATA INTEGRITY & CATALOG HEALTH");
  console.log("==========================================\n");

  const products = await prisma.product.findMany({
    include: { images: true }
  });

  const totalProducts = products.length;
  console.log(`Total Products in Database: ${totalProducts}`);

  let issues = 0;

  const duplicateSkus = new Set();
  const duplicateNames = new Set();
  const seenSkus = new Set();
  const seenNames = new Set();

  let productsMissingImages = 0;
  let productsWithInvalidImages = 0;
  let productsWithShortDescription = 0;
  let productsMissingCategory = 0;
  let productsMissingBrand = 0;
  let productsWithNegativeStock = 0;

  for (const product of products) {
    // Duplicate Detection
    if (seenSkus.has(product.sku)) duplicateSkus.add(product.sku);
    else seenSkus.add(product.sku);

    if (seenNames.has(product.name)) duplicateNames.add(product.name);
    else seenNames.add(product.name);

    // Product image validation & Database relationships
    if (!product.images || product.images.length === 0) {
      productsMissingImages++;
      issues++;
    } else {
      // Cloudinary/Unsplash verification
      for (const img of product.images) {
        if (!img.url.startsWith("http")) {
          productsWithInvalidImages++;
          issues++;
          break; // only count once per product
        }
      }
    }

    // Product-description accuracy
    if (!product.description || product.description.length < 10) {
      productsWithShortDescription++;
      issues++;
    }

    // Category integrity
    if (!product.category || product.category.trim() === "") {
      productsMissingCategory++;
      issues++;
    }

    // Brand integrity
    if (!product.brand || product.brand.trim() === "") {
      productsMissingBrand++;
      issues++;
    }

    // Inventory consistency
    if (product.stock < 0) {
      productsWithNegativeStock++;
      issues++;
    }
  }

  console.log("\n--- Audit Results ---");
  console.log(`[Image Validation] Products missing images: ${productsMissingImages}`);
  console.log(`[Cloudinary/URL Verification] Products with invalid image URLs: ${productsWithInvalidImages}`);
  console.log(`[Description Accuracy] Products with missing/short descriptions: ${productsWithShortDescription}`);
  console.log(`[Category Integrity] Products missing category: ${productsMissingCategory}`);
  console.log(`[Brand Integrity] Products missing brand: ${productsMissingBrand}`);
  console.log(`[Inventory Consistency] Products with negative stock: ${productsWithNegativeStock}`);
  console.log(`[Duplicate Detection] Duplicate SKUs: ${duplicateSkus.size}`);
  console.log(`[Duplicate Detection] Duplicate Names: ${duplicateNames.size}`);

  console.log("\n==========================================");
  if (issues === 0 && duplicateSkus.size === 0 && duplicateNames.size === 0) {
    console.log("STATUS: PASS - Zero broken data!");
  } else {
    console.log(`STATUS: FAIL - Found ${issues + duplicateSkus.size + duplicateNames.size} issues.`);
  }
  console.log("==========================================");
}

auditCatalog()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
