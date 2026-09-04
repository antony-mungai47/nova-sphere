import { ServerNavbar as Navbar } from "@/shared/components/layout/ServerNavbar";
import { 
  TrendingCategories, 
  FlashDealsCarousel, 
  BestSellers, 
  NewArrivals, 
  FeaturedVendors, 
  WhyShopNova, 
  CustomerReviews, 
  DownloadAppBanner 
} from "@/domains/Experience/components/home/homepage-sections";
import { Footer } from "@/shared/components/layout/footer";
import { StorefrontProductQueryService } from "@/modules/commerce/application/queries/StorefrontProductQueryService";

export default async function Home() {
  const products = await StorefrontProductQueryService.getTrendingProducts([], 4);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* 1. Sticky Glass Nav */}
      <Navbar />

      {/* 2. Hero Section */}
      <section className="relative w-full h-[600px] overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-white">
            Smart Shopping Delivered
          </h1>
          <p className="text-lg md:text-xl font-medium mb-8 max-w-2xl text-white/80">
            The marketplace that understands you.
          </p>
          <a 
            href="/store"
            className="px-8 py-4 rounded-full font-bold transition-all shadow-hover bg-white text-black hover:bg-gray-100"
          >
            Start Browsing
          </a>
        </div>
      </section>

      {/* 3. Trending Categories */}
      <TrendingCategories />

      {/* 4. Flash Deals Carousel */}
      <FlashDealsCarousel />

      {/* 5. Best Sellers */}
      <BestSellers />

      {/* 6. New Arrivals */}
      <NewArrivals />

      {/* 7. Featured Vendors */}
      <FeaturedVendors />

      {/* 8. Why Shop Nova Sphere */}
      <WhyShopNova />

      {/* 9. Customer Reviews */}
      <CustomerReviews />

      {/* 10. Download App Banner */}
      <DownloadAppBanner />

      {/* 11. Corporate Footer */}
      <Footer />
    </main>
  );
}
