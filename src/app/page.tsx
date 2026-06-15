import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/home/hero-section";
import { TrendingProducts } from "@/components/home/trending-products";
import { Footer } from "@/components/layout/footer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { isTrending: true },
    include: { images: true },
    take: 4,
  });

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    brand: p.brand,
    image: p.images[0]?.url || "/hero-product.png",
    description: p.description,
    salePrice: p.salePrice,
    rating: p.rating,
    reviewCount: p.reviewCount,
  }));

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <TrendingProducts initialProducts={formattedProducts} />
      <Footer />
    </main>
  );
}
