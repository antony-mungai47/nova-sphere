const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  const products = [
    {
      name: "NOVA Sound Core X1",
      description: "Experience absolute acoustic perfection with the Sound Core X1. Featuring quantum-tuned drivers and adaptive noise cancellation that completely isolates you in your own sonic universe. The aerospace-grade aluminum chassis ensures durability while maintaining a feather-light feel.",
      price: 299.00,
      category: "Audio",
      imageUrl: "/hero-product.png",
      stock: 100,
      isTrending: true,
    },
    {
      name: "Aura Smartwatch Pro",
      description: "The Aura Smartwatch Pro doesn't just track your health; it predicts it. Using proprietary bio-sensors, it monitors your vitals in real-time. The edge-to-edge holographic display brings your data to life with unparalleled clarity.",
      price: 349.00,
      category: "Wearables",
      imageUrl: "/smartwatch.png",
      stock: 50,
      isTrending: true,
    },
    {
      name: "HoloLens Display",
      description: "Transform any environment into a digital workspace. The HoloLens Display projects crystal clear 8K augmented reality overlays directly into your field of vision. Perfect for professionals who need zero-latency spatial computing.",
      price: 899.00,
      category: "Displays",
      imageUrl: "/smartwatch.png",
      stock: 25,
      isTrending: true,
    },
    {
      name: "Neural Link Earbuds",
      description: "Control your audio with your mind. The Neural Link Earbuds interpret subtle bio-electric signals to adjust volume, skip tracks, and answer calls without you ever lifting a finger. Welcome to the telepathic age of audio.",
      price: 199.00,
      category: "Audio",
      imageUrl: "/hero-product.png",
      stock: 200,
      isTrending: true,
    }
  ]

  for (const p of products) {
    const product = await prisma.product.create({
      data: p,
    })
    console.log(`Created product with id: ${product.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
