import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function runAudit() {
  console.log("Starting Platform Audit...");
  const report = {
    totalProducts: 0,
    totalAuctions: 0,
    totalImages: 0,
    brokenImages: [] as any[],
    missingImages: [] as any[],
    duplicateProducts: [] as any[],
    outOfStockProducts: [] as any[],
    categoryAnomalies: [] as any[]
  };

  const products = await prisma.product.findMany({
    include: { images: true, auctions: true }
  });

  report.totalProducts = products.length;

  const nameSet = new Set<string>();
  const validCategories = ["Electronics", "Home & Kitchen", "Fashion", "Office", "Travel", "Fitness", "Gaming", "Antiques", "Art"];

  for (const product of products) {
    // Duplicates Check
    if (nameSet.has(product.name)) {
      report.duplicateProducts.push({ id: product.id, name: product.name });
    }
    nameSet.add(product.name);

    // Stock Check
    if (product.stock === 0) {
      report.outOfStockProducts.push({ id: product.id, name: product.name });
    }

    // Category Check
    if (!validCategories.includes(product.category)) {
      report.categoryAnomalies.push({ id: product.id, name: product.name, category: product.category });
    }

    // Image Check
    if (!product.images || product.images.length === 0) {
      report.missingImages.push({ id: product.id, name: product.name });
    } else {
      for (const img of product.images) {
        report.totalImages++;
        if (!img.url || (!img.url.startsWith("http") && !img.url.startsWith("/"))) {
          report.brokenImages.push({ id: product.id, name: product.name, url: img.url });
        }
      }
    }

    report.totalAuctions += product.auctions.length;
  }

  const reportString = JSON.stringify(report, null, 2);
  fs.writeFileSync('audit_report.json', reportString);
  console.log("Audit complete. Report saved to audit_report.json");
  
  if (report.brokenImages.length > 0 || report.missingImages.length > 0) {
    console.log(`WARNING: Found ${report.brokenImages.length} broken images and ${report.missingImages.length} products missing images.`);
  } else {
    console.log("SUCCESS: Image integrity verified.");
  }
}

runAudit()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
