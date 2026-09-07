import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const mockProducts = [
  {
    name: "Quantum Noise-Canceling Headphones",
    description: "Experience silence with our next-gen quantum audio processors.",
    price: 299.99,
    salePrice: 249.99,
    sku: "AUDIO-QN-001",
    category: "Audio",
    brand: "SonicWave",
    stock: 150,
    isTrending: true,
    rating: 4.8,
    reviewCount: 342,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    version: 1,
    images: [{ url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", isPrimary: true, order: 0 }]
  },
  {
    name: "Nebula Smart Watch Series X",
    description: "Track your health across the multiverse.",
    price: 399.99,
    sku: "WEAR-NB-002",
    category: "Wearables",
    brand: "NovaTech",
    stock: 85,
    isTrending: true,
    rating: 4.5,
    reviewCount: 128,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    version: 1,
    images: [{ url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80", isPrimary: true, order: 0 }]
  },
  {
    name: "Aero Mechanical Keyboard",
    description: "Tactile feedback designed for lightspeed typists.",
    price: 149.99,
    salePrice: 129.99,
    sku: "PERIPH-AM-003",
    category: "Peripherals",
    brand: "KeyMaster",
    stock: 300,
    isTrending: false,
    rating: 4.9,
    reviewCount: 512,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    version: 1,
    images: [{ url: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80", isPrimary: true, order: 0 }]
  },
  {
    name: "Lumina 4K Web Camera",
    description: "Crystal clear streaming with AI auto-framing.",
    price: 199.99,
    sku: "CAM-LM-004",
    category: "Cameras",
    brand: "Visionary",
    stock: 45,
    isTrending: true,
    rating: 4.3,
    reviewCount: 89,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    version: 1,
    images: [{ url: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&q=80", isPrimary: true, order: 0 }]
  },
  {
    name: "ErgoCurve Office Chair",
    description: "Ultimate lumbar support for long coding sessions.",
    price: 549.99,
    salePrice: 499.99,
    sku: "FURN-EC-005",
    category: "Furniture",
    brand: "ComfortPlus",
    stock: 20,
    isTrending: false,
    rating: 4.7,
    reviewCount: 204,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    version: 1,
    images: [{ url: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80", isPrimary: true, order: 0 }]
  },
  {
    name: "Stellar 32\" Curved Monitor",
    description: "Immersive 144Hz display for creators and gamers.",
    price: 499.99,
    sku: "DISP-ST-006",
    category: "Displays",
    brand: "NovaTech",
    stock: 60,
    isTrending: true,
    rating: 4.6,
    reviewCount: 420,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    version: 1,
    images: [{ url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80", isPrimary: true, order: 0 }]
  }
];

async function main() {
  console.log("Seeding realistic products...");
  
  for (const productData of mockProducts) {
    const { images, ...data } = productData;
    
    // Check if it already exists by SKU
    const existing = await prisma.product.findFirst({ where: { sku: data.sku } });
    if (!existing) {
      const created = await prisma.product.create({
        data: {
          ...data,
          status: data.status as any,
          approvalStatus: data.approvalStatus as any,
          images: {
            create: images
          }
        }
      });
      console.log(`Created product: ${created.name}`);
    } else {
      console.log(`Skipping ${data.name} (already exists)`);
    }
  }
  
  // Let's also update the "Nova Sphere Launch Verification" to ACTIVE so it shows up.
  await prisma.product.updateMany({
    where: { sku: 'NS-LAUNCH-VERIFY-001' },
    data: { status: 'ACTIVE' }
  });
  
  console.log("Seeding complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
