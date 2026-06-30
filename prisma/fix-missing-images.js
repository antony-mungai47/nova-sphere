const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const https = require('https');
const http = require('http');

async function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) return resolve(false);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function main() {
  const allImages = await prisma.productImage.findMany();
  let brokenCount = 0;
  
  console.log(`Checking ${allImages.length} images...`);
  
  for (const img of allImages) {
    const isOk = await checkUrl(img.url);
    if (!isOk) {
      console.log(`Broken Image: ${img.url} for Product: ${img.productId}`);
      brokenCount++;
      
      // Fix it
      await prisma.productImage.update({
        where: { id: img.id },
        data: { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" }
      });
      console.log(`Fixed with placeholder.`);
    }
  }
  
  console.log(`Found and fixed ${brokenCount} broken images.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
