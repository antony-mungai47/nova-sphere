import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding auctions...');

  // Create products for auctions
  const auctionProducts = [
    {
      name: "Rolex Submariner Date 116610LN",
      description: "Pre-owned Rolex Submariner Date with black dial and ceramic bezel. Includes original box and papers.",
      price: 12000,
      sku: "AUC-RLX-001",
      category: "Luxury Watches",
      brand: "Rolex",
      stock: 1,
      image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80"
    },
    {
      name: "Ming Dynasty Porcelain Vase",
      description: "Authentic 15th-century Ming Dynasty blue and white porcelain vase. Certified by leading antiquities experts.",
      price: 45000,
      sku: "AUC-ANT-002",
      category: "Antiques",
      brand: "Historical",
      stock: 1,
      image: "https://images.unsplash.com/photo-1584598007621-e73719464506?w=800&q=80"
    },
    {
      name: "1st Edition Charizard Holographic - PSA 10",
      description: "The holy grail of Pokémon card collecting. Base Set 1st Edition Charizard, graded PSA 10 Gem Mint.",
      price: 300000,
      sku: "AUC-COL-003",
      category: "Collectibles",
      brand: "Pokemon",
      stock: 1,
      image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=800&q=80"
    },
    {
      name: "Apple-1 Computer Original Motherboard",
      description: "Extremely rare original Apple-1 motherboard from 1976. Fully operational and authenticated by Steve Wozniak.",
      price: 400000,
      sku: "AUC-ELC-004",
      category: "Rare Electronics",
      brand: "Apple",
      stock: 1,
      image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80"
    },
    {
      name: "Original 'Girl with Balloon' Sketch by Banksy",
      description: "Original preliminary sketch for the iconic 'Girl with Balloon' mural. Comes with Pest Control certificate of authenticity.",
      price: 85000,
      sku: "AUC-ART-005",
      category: "Art",
      brand: "Banksy",
      stock: 1,
      image: "https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?w=800&q=80"
    }
  ];

  for (const p of auctionProducts) {
    const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
    if (!existing) {
      const product = await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          sku: p.sku,
          category: p.category,
          brand: p.brand,
          stock: p.stock,
          images: {
            create: {
              url: p.image,
              alt: p.name,
              isPrimary: true
            }
          }
        }
      });

      // Create an auction for it
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + Math.floor(Math.random() * 5) + 1); // 1 to 5 days from now

      await prisma.auction.create({
        data: {
          productId: product.id,
          baseAmount: p.price * 0.5, // Start bidding at 50% of value
          currentBid: 0,
          status: "LIVE",
          endTime: endTime
        }
      });
      console.log(`Created auction for ${product.name}`);
    } else {
      console.log(`Skipped existing product ${p.sku}`);
    }
  }

  console.log('Auction seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
