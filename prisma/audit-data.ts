import { PrismaClient } from '@prisma/client';
import https from 'https';
import http from 'http';

const prisma = new PrismaClient();

async function checkUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) return resolve(false);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      resolve(res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 400);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function runAudit() {
  console.log("=== NOVA SPHERE DATA AUDIT ===");
  
  const products = await prisma.product.findMany({
    include: { images: true, auctions: true }
  });

  console.log(`Total Products: ${products.length}`);

  let missingImages = 0;
  let brokenUrls = 0;
  let auctionMissingImages = 0;

  const categories = new Set<string>();

  for (const product of products) {
    categories.add(product.category);

    if (product.images.length === 0) {
      console.log(`[NO IMAGE] Product: ${product.name} (SKU: ${product.sku}, Category: ${product.category})`);
      missingImages++;
    } else {
      for (const img of product.images) {
        const isOk = await checkUrl(img.url);
        if (!isOk) {
          console.log(`[BROKEN URL] Product: ${product.name} | URL: ${img.url}`);
          brokenUrls++;
        }
      }
    }

    if (product.auctions.length > 0 && product.images.length === 0) {
      console.log(`[AUCTION MISSING IMAGE] Auction for: ${product.name}`);
      auctionMissingImages++;
    }
  }

  console.log("\n=== CATEGORIES FOUND ===");
  console.log(Array.from(categories).join(", "));

  console.log("\n=== AUDIT SUMMARY ===");
  console.log(`Missing Images: ${missingImages}`);
  console.log(`Broken URLs: ${brokenUrls}`);
  console.log(`Auction Products Missing Images: ${auctionMissingImages}`);
}

runAudit()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
