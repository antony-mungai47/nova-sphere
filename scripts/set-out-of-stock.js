const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const product = await prisma.product.findFirst();
  if (product) {
    await prisma.product.update({ where: { id: product.id }, data: { stock: 0 } });
    console.log("Updated product to 0 stock:", product.id);
  } else {
    console.log("No product found");
  }
}
main();
