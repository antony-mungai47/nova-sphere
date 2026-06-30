import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.count();
  const categories = (await prisma.product.groupBy({ by: ["category"] })).length;
  const customers = await prisma.user.count();
  const orders = await prisma.order.count();
  const reviews = await prisma.review.count();
  const images = await prisma.productImage.count();

  console.log(JSON.stringify({ products, categories, customers, orders, reviews, images }, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
