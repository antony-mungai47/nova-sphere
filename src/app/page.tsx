import { ServerNavbar as Navbar } from "@/shared/components/layout/ServerNavbar";
import { DynamicHero } from "@/domains/personalization/components/DynamicHero";
import { ContextualOffer } from "@/domains/personalization/components/ContextualOffer";
import { RankedProductRow } from "@/domains/personalization/components/RankedProductRow";
import { 
  TrendingCategories, 
  FlashDealsCarousel, 
  RecommendedProducts, 
  BestSellers, 
  NewArrivals, 
  FeaturedVendors, 
  WhyShopNova, 
  CustomerReviews, 
  DownloadAppBanner 
} from "@/domains/Experience/components/home/homepage-sections";
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
    <main className="min-h-screen flex flex-col bg-background">
      {/* 1. Sticky Glass Nav */}
      <Navbar />
      
      {/* Experience Engine: Contextual Offer & Dynamic Hero */}
      <ContextualOffer />
      <DynamicHero />

      {/* 3. Trending Categories */}
      <TrendingCategories />

      {/* 4. Flash Deals Carousel */}
      <FlashDealsCarousel />

      {/* 5. Recommended For You (Experience Engine) */}
      <RankedProductRow 
        title="Recommended For You" 
        rawProducts={formattedProducts.map(p => ({
          id: p.id,
          category: p.category,
          price: p.price,
          popularity: p.rating / 5, // mock popularity
          margin: 0.2, // mock margin
          isNew: false
        }))} 
      />

      {/* 6. Best Sellers (re-using trending query for now) */}
      <BestSellers />

      {/* 7. New Arrivals */}
      <NewArrivals />

      {/* 8. Featured Vendors */}
      <FeaturedVendors />

      {/* 9. Why Shop Nova Sphere */}
      <WhyShopNova />

      {/* 10. Customer Reviews */}
      <CustomerReviews />

      {/* 11. Download App Banner */}
      <DownloadAppBanner />


      {/* 13. Corporate Footer */}
      <Footer />
    </main>
  );
}
