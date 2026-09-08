import { prisma } from "@/lib/prisma";
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
import { AuctionHighlights } from "@/domains/Experience/components/home/auction-highlights";
import { Footer } from "@/shared/components/layout/footer";
import { StorefrontProductQueryService } from "@/modules/commerce/application/queries/StorefrontProductQueryService";

export default async function Home() {
  const [trending, allProducts, liveAuctions] = await Promise.all([
    StorefrontProductQueryService.getTrendingProducts([], 8),
    StorefrontProductQueryService.searchCatalog({}),
    prisma.auction.findMany({
      where: { status: 'LIVE' },
      include: { product: { include: { images: true } }, _count: { select: { bids: true } } },
      take: 4,
      orderBy: { endTime: 'asc' }
    })
  ]);

  const newArrivals = [...allProducts].reverse().slice(0, 8);
  const flashDeals = allProducts.filter(p => p.salePrice).slice(0, 8);

  return (
    <main className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cta-primary/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* 1. Sticky Glass Nav */}
      <Navbar />

      {/* 2. Glassmorphism Hero Section */}
      <section className="relative w-full py-16 flex items-center justify-center overflow-hidden">
        {/* Nova Sphere Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] z-0">
          <h1 className="text-[15vw] font-black tracking-tighter whitespace-nowrap">
            NOVA SPHERE
          </h1>
        </div>

        <div className="container relative z-10 px-6 mx-auto flex flex-col items-center justify-center text-center mt-8">
          <div className="glass-panel rounded-3xl p-10 md:p-16 max-w-4xl shadow-2xl relative overflow-hidden">
            {/* Inner glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-cta-primary to-transparent opacity-50" />
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8">
              <span className="w-2 h-2 rounded-full bg-cta-primary animate-pulse" />
              <span className="text-sm font-bold text-muted">Nova Sphere Market 3.0</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground to-muted">
              Smart Shopping <br className="hidden md:block"/>
              <span className="text-cta-primary drop-shadow-sm">Delivered.</span>
            </h1>
            
            <p className="text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto text-muted leading-relaxed font-bold">
              Experience the future of commerce. Curated collections, AI-driven recommendations, and unparalleled aesthetics in one seamless marketplace.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="/store"
                className="group relative px-8 py-4 rounded-xl font-bold transition-all bg-cta-primary text-white overflow-hidden shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_0_60px_-15px_rgba(249,115,22,0.7)] hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative flex items-center gap-2">
                  Start Browsing
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </span>
              </a>
              <a 
                href="/recommended"
                className="px-8 py-4 rounded-xl font-bold transition-all glass-panel text-foreground font-bold hover:bg-white/80 transition-all"
              >
                View Curated Deals
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trending Categories */}
      <TrendingCategories />

      {/* Premium Live Auctions */}
      <AuctionHighlights auctions={JSON.parse(JSON.stringify(liveAuctions))} />

      {/* 4. Flash Deals Carousel */}
      <FlashDealsCarousel products={flashDeals.length ? flashDeals : trending} />

      {/* 5. Best Sellers */}
      <BestSellers products={trending} />

      {/* 6. New Arrivals */}
      <NewArrivals products={newArrivals} />

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
