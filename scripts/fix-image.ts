import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixImage() {
  const product = await prisma.product.findFirst({
    where: { name: { contains: "Girl with Balloon" } },
    include: { images: true }
  });

  if (!product) {
    console.log("Product not found");
    return;
  }

  // update the existing image URL to a reliable Unsplash image for art/paintings
  const newUrl = "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80";
  
  if (product.images.length > 0) {
    await prisma.productImage.update({
      where: { id: product.images[0].id },
      data: { url: newUrl }
    });
    console.log("Image updated to new URL.");
  } else {
    await prisma.productImage.create({
      data: {
        url: newUrl,
        alt: "Original Girl with Balloon by Banksy",
        productId: product.id,
        order: 0,
      }
    });
    console.log("Image created.");
  }
}

fixImage()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
