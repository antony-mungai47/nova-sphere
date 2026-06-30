import { Navbar } from "@/shared/components/layout/navbar";
import { HeroSection } from "@/domains/Experience/components/home/hero-section";
import { TrendingProducts } from "@/domains/Experience/components/home/trending-products";
import { Footer } from "@/shared/components/layout/footer";
import { prisma } from "@/lib/prisma";

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
