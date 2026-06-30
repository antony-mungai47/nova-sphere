import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const products = await prisma.product.findMany({
    where: { category: { contains: 'Antique', mode: 'insensitive' } },
    include: { images: true }
  });
  console.log("Products containing 'Antique':", JSON.stringify(products, null, 2));

  // Let's also check for any auctions that might be antiques
  const auctions = await prisma.auction.findMany({
    include: { product: { include: { images: true } } }
  });
  const antiqueAuctions = auctions.filter(a => a.product.category.toLowerCase().includes('antique'));
  console.log("Auctions with 'Antique':", JSON.stringify(antiqueAuctions, null, 2));
}

run().catch(console.error).finally(()=>prisma.$disconnect());
