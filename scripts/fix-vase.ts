import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixVase() {
  const product = await prisma.product.findFirst({
    where: { name: { contains: "Ming Dynasty Porcelain Vase" } },
    include: { images: true }
  });

  if (!product) {
    console.log("Product not found");
    return;
  }

  const newUrl = "https://images.unsplash.com/photo-1610214644265-27663fdfbeec?w=800&q=80"; // A vase image
  
  if (product.images.length > 0) {
    await prisma.productImage.update({
      where: { id: product.images[0].id },
      data: { url: newUrl }
    });
    console.log("Vase image updated.");
  }
}

fixVase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
