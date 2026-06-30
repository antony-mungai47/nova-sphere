import { prisma } from './src/lib/prisma';
async function main() {
  const count = await prisma.product.count({ where: { images: { none: {} } } });
  console.log('Products without images:', count);
}
main();
