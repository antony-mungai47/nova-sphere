import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log("=== GATE 4: PRODUCT CATALOG INTEGRITY ===");
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products.`);
  let mismatches = 0;
  for (const p of products) {
    let imageMatch = true;
    let descMatch = true;
    let specsMatch = true;
    let status = "PASS";
    
    // basic heuristics:
    if (!p.image || p.image.includes('unsplash')) {
      imageMatch = false;
      status = "FAIL (Unsplash image)";
    }
    // ensure description mentions the name
    if (!p.description.toLowerCase().includes(p.name.toLowerCase().split(' ')[0])) {
      descMatch = false;
      status = "FAIL (Description mismatch)";
    }
    
    if (status !== "PASS") {
      console.log(`- ${p.sku} | ${p.name} | ${imageMatch} | ${descMatch} | ${specsMatch} | ${status}`);
      mismatches++;
    }
  }
  if (mismatches === 0) {
    console.log("0 mismatches found.");
  }
  console.log("Product check complete.\n");

  console.log("=== GATE 10: FEATURE FLAGS ===");
  const flags = await prisma.featureFlag.findMany();
  for (const f of flags) {
    console.log(`- ${f.name} | Enabled: ${f.isEnabled}`);
  }
}

main().finally(() => prisma.$disconnect());
