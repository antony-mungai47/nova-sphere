import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseHealth() {
  console.log("--- DATABASE HEALTH REPORT ---");
  
  const productCount = await prisma.product.count();
  const userCount = await prisma.user.count();
  const orderCount = await prisma.order.count();
  const reviewCount = await prisma.review.count();
  
  console.log(`Total Products: ${productCount}`);
  console.log(`Total Users: ${userCount}`);
  console.log(`Total Orders: ${orderCount}`);
  console.log(`Total Reviews: ${reviewCount}`);
  
  // Categories are distinct fields in products
  const categories = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
  });
  console.log(`Total Categories: ${categories.length}`);

  // Duplicate SKUs
  const products = await prisma.product.findMany({ select: { sku: true } });
  const skus = products.map(p => p.sku);
  const uniqueSkus = new Set(skus);
  const duplicates = skus.length - uniqueSkus.size;
  console.log(`Duplicate SKUs: ${duplicates}`);

  // Image Health
  const images = await prisma.productImage.findMany();
  const missingImages = images.filter(img => !img.url || img.url.trim() === '');
  const placeholderImages = images.filter(img => img.url.includes('placeholder') || img.url.includes('via.placeholder.com'));
  
  console.log(`Total Images: ${images.length}`);
  console.log(`Missing Image URLs: ${missingImages.length}`);
  console.log(`Placeholder Images: ${placeholderImages.length}`);
  
  await prisma.$disconnect();
}

checkDatabaseHealth().catch(console.error);
