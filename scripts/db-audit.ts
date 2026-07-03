import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('Running Data Audit...');
  const auditReport = {
    products: 0,
    brokenImages: 0,
    duplicateSkus: 0,
    orphanImages: 0,
    invalidJson: 0,
    missingCategories: 0,
    zeroOrNegativePrices: 0,
  };

  const products = await prisma.product.findMany({
    include: { images: true }
  });

  auditReport.products = products.length;
  
  const skuSet = new Set<string>();

  for (const p of products) {
    if (skuSet.has(p.sku)) auditReport.duplicateSkus++;
    skuSet.add(p.sku);

    if (p.price.toNumber() <= 0) auditReport.zeroOrNegativePrices++;
    
    // Check JSON
    if (p.specs) {
      try { JSON.parse(p.specs as string); } catch (e) { auditReport.invalidJson++; }
    }
    if (p.features) {
      try { JSON.parse(p.features as string); } catch (e) { auditReport.invalidJson++; }
    }
    
    // Check images
    if (p.images.length === 0) auditReport.brokenImages++;
  }

  // Check Orphan Images
  const allImages = await prisma.productImage.findMany();
  for (const img of allImages) {
    const p = await prisma.product.findUnique({ where: { id: img.productId } });
    if (!p) auditReport.orphanImages++;
  }

  fs.writeFileSync('db-audit-report.json', JSON.stringify(auditReport, null, 2));
  console.log('Audit completed. Report saved to db-audit-report.json');
  console.log(auditReport);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
