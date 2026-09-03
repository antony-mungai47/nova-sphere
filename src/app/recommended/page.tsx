import React from "react";

import { ServerNavbar as Navbar } from "@/shared/components/layout/ServerNavbar";
import { Footer } from "@/shared/components/layout/footer";
import { IdentityFacade } from "@/modules/identity/IdentityFacade";
import { headers } from "next/headers";
import { ProductGridV3 } from "@/domains/Commerce/products/components/store/v3-product-grid";
import { Sparkles, Activity } from "lucide-react";
import { StorefrontProductQueryService } from "@/modules/commerce/application/queries/StorefrontProductQueryService";

export const revalidate = 0; // Fully dynamic personalization

export default async function RecommendedPage() {
  const user = await IdentityFacade.getCurrentUser();
  const headersList = await headers();
  const country = headersList.get('x-vercel-ip-country') || 'US';
  
  const recommendations = await StorefrontProductQueryService.getRecommendedProducts(user, country);
  
  const formattedProducts = recommendations.products;
  const userContext = recommendations.userContext;
  const confidenceScore = recommendations.confidenceScore;
  const preferredCategories = recommendations.preferredCategories;

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
          <ProductGridV3 
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
