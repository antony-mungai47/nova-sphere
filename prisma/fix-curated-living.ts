import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const IMAGE_MAP: Record<string, string[]> = {
  'Home & Kitchen': [
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80', // interior
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80', // kitchen
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', // living room
  ],
  'Collectibles': [
    'https://images.unsplash.com/photo-1610214644265-27663fdfbeec?w=800&q=80', // old camera/collectible
    'https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?w=800&q=80', // book/antique
    'https://images.unsplash.com/photo-1550853024-fae8cd4be47f?w=800&q=80', // old coin/stamp type aesthetic
  ],
  'Antiques': [
    'https://images.unsplash.com/photo-1522067425176-0f3df931d871?w=800&q=80', // antique clock
    'https://images.unsplash.com/photo-1583590518389-7a5416b9b3bd?w=800&q=80', // old car/antique
  ],
  'Art': [
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80', // painting
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80', // sculpture
  ]
};

async function runFix() {
  console.log("=== FIXING IMAGE MISMATCHES ===");
  
  const products = await prisma.product.findMany({
    include: { images: true }
  });

  for (const product of products) {
    let newUrl = null;
    
    // Assign better images if the category exists in mapping
    if (IMAGE_MAP[product.category]) {
      const urls = IMAGE_MAP[product.category];
      // Pick random or pseudo-random based on string length
      newUrl = urls[product.name.length % urls.length];
    }
    
    // Also, if it has the generic headphone placeholder but isn't electronics
    if (product.images.some(img => img.url.includes('1505740420928'))) {
      if (product.category !== 'Electronics' && newUrl) {
         await prisma.productImage.updateMany({
           where: { productId: product.id },
           data: { url: newUrl }
         });
         console.log(`Updated ${product.category} product ${product.name} with better image.`);
      }
    }
  }

  console.log("=== DONE ===");
}

runFix()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
