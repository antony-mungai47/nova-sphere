import React from "react";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/shared/components/layout/navbar";
import { Footer } from "@/shared/components/layout/footer";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { ProductGrid } from "@/domains/Commerce/products/components/store/product-grid";
import { Sparkles, Activity } from "lucide-react";

export const revalidate = 0; // Fully dynamic personalization

export default async function RecommendedPage() {
  const { userId } = await auth();
  const headersList = await headers();
  const country = headersList.get('x-vercel-ip-country') || 'US';
  
  let preferredCategories: string[] = [];
  let userContext = "Welcome to the future of smart shopping.";
  let confidenceScore = 65; // Baseline confidence

  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        recentlyViewed: { include: { product: true }, orderBy: { viewedAt: 'desc' }, take: 20 },
        orders: { include: { items: { include: { product: true } } } },
      }
    });

    if (dbUser) {
      const categoryCounts: Record<string, number> = {};
      let totalInteractions = 0;

      dbUser.recentlyViewed.forEach(rv => {
        categoryCounts[rv.product.category] = (categoryCounts[rv.product.category] || 0) + 2;
        totalInteractions += 2;
      });
      
      dbUser.orders.forEach(order => {
        order.items.forEach(item => {
          categoryCounts[item.product.category] = (categoryCounts[item.product.category] || 0) + 5;
          totalInteractions += 5;
        });
      });
      
      preferredCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .map(e => e[0])
        .slice(0, 4); // Top 4 categories
        
      if (preferredCategories.length > 0) {
        userContext = `Curated for you based on your interest in ${preferredCategories.join(", ")}.`;
        confidenceScore = Math.min(98, 65 + (totalInteractions * 2));
      } else {
        userContext = "We need a bit more data to personalize your experience. Explore the store!";
      }
    }
  } else {
    // Guest Personalization
    const month = new Date().getMonth();
    if (month >= 5 && month <= 7) preferredCategories = ["Travel", "Fashion"]; 
    else if (month >= 10 || month === 0) preferredCategories = ["Electronics", "Home & Kitchen"]; 
    else preferredCategories = ["Watches", "Collectibles"]; 

    if (country === 'GB' || country === 'FR' || country === 'DE') {
      userContext = "Trending across Europe this season.";
      confidenceScore = 75;
    } else if (country === 'US' || country === 'CA') {
      userContext = "Top selections for North America.";
      confidenceScore = 78;
    } else {
      userContext = "Global marketplace highlights.";
    }
  }

  // Fetch Recommended Products
  const products = await prisma.product.findMany({
    where: preferredCategories.length > 0 ? {
      OR: [
        { category: { in: preferredCategories } },
        { isTrending: true }
      ]
    } : { isTrending: true },
    include: { images: true },
    orderBy: { rating: 'desc' },
    take: 24, // Larger grid for the dedicated page
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
    stock: p.stock,
  }));

  // Fetch aggregate data for the sidebar filters (even though they are recommended, users might still want to filter)
  const uniqueCategories = Array.from(new Set(formattedProducts.map(p => p.category)));
  const uniqueBrands = Array.from(new Set(formattedProducts.map(p => p.brand)));

  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-nova-blue/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
        
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-nova-blue/10 flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-nova-blue" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Recommended <span className="text-transparent bg-clip-text bg-gradient-to-r from-nova-blue to-nova-emerald">For You</span>
            </h1>
            <p className="text-xl text-nova-silver max-w-2xl mx-auto mb-8">
              {userContext}
            </p>

            <div className="glass-panel px-6 py-3 rounded-full border border-nova-emerald/30 bg-nova-emerald/5 flex items-center gap-3">
              <Activity className="w-4 h-4 text-nova-emerald animate-pulse" />
              <span className="text-sm font-bold text-white tracking-wider">
                MATCH CONFIDENCE: <span className="text-nova-emerald">{confidenceScore}%</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 pb-24">
        <div className="container mx-auto px-6">
          <ProductGrid 
            initialProducts={formattedProducts} 
            uniqueCategories={['All', ...uniqueCategories]} 
            uniqueBrands={['All', ...uniqueBrands]}
            // totalCount={formattedProducts.length}
            // currentPage={1}
            // limit={24}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
