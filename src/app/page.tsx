import { ServerNavbar as Navbar } from "@/shared/components/layout/ServerNavbar";
import { HeroSection } from "@/domains/Experience/components/home/hero-section";
import { TrendingProducts } from "@/domains/Experience/components/home/trending-products";
import { LiveTicker } from "@/domains/Experience/components/home/live-ticker";
import { Footer } from "@/shared/components/layout/footer";
import { prisma } from "@/lib/prisma";
import { getFeatureFlag } from "@/domains/Foundation/feature-flags/actions";
import { FeatureFlags } from "@/domains/Foundation/feature-flags/flags";

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { isTrending: true },
    include: { images: true },
    take: 4,
  });

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price.toNumber(),
    category: p.category,
    brand: p.brand,
    image: p.images[0]?.url || "/hero-product.png",
    description: p.description,
    salePrice: p.salePrice ? p.salePrice.toNumber() : null,
    rating: p.rating,
    reviewCount: p.reviewCount,
  }));

  const liveActivityEnabled = await getFeatureFlag(FeatureFlags.LIVE_ACTIVITY);

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <LiveTicker liveActivityEnabled={liveActivityEnabled} />
      <TrendingProducts initialProducts={formattedProducts} />
      <Footer />
    </main>
  );
}
