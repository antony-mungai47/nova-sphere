import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function auditImages() {
  console.log("Starting Image Audit...");
  const images = await prisma.productImage.findMany({
    include: { product: true }
  });

  let brokenCount = 0;
  let placeholderCount = 0;
  let optimizedCount = 0;

  for (const img of images) {
    // Check if it's a known generic placeholder
    if (img.url.includes('placeholder') || img.url === '/hero-product.png') {
      console.log(`[PLACEHOLDER] Product: ${img.product.name} | URL: ${img.url}`);
      placeholderCount++;
      continue;
    }

    const isOk = await checkUrl(img.url);
    if (!isOk) {
      console.log(`[BROKEN 404] Product: ${img.product.name} | URL: ${img.url}`);
      brokenCount++;
    } else {
      optimizedCount++;
    }
  }

  console.log(`\nAudit Complete:`);
  console.log(`Total Images: ${images.length}`);
  console.log(`Optimized/Working: ${optimizedCount}`);
  console.log(`Broken (404): ${brokenCount}`);
  console.log(`Placeholders: ${placeholderCount}`);
}

auditImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
