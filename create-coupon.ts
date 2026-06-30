import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.coupon.upsert({
    where: { code: 'NOVA10' },
    update: { discountPercent: 10, isActive: true },
    create: { code: 'NOVA10', discountPercent: 10, isActive: true }
  });
  console.log('Coupon NOVA10 created!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
