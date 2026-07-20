"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Star } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useInventory } from "@/domains/Realtime/hooks/useInventory";
import { ProductGallery } from "@/domains/Experience/components/product/ProductGallery";
import { StickyPurchasePanel } from "@/domains/Experience/components/product/StickyPurchasePanel";
import { InteractiveActions } from "@/domains/Experience/components/product/InteractiveActions";
import { ProductHighlights } from "@/domains/Experience/components/product/ProductHighlights";
import { ProductAccordion } from "@/domains/Experience/components/product/ProductAccordion";
import { ProductReviews } from "@/domains/Experience/components/reviews/ProductReviews";
import { CommunityQA } from "@/domains/Experience/components/qa/CommunityQA";
import { UpsellDrawer } from "@/domains/Experience/components/conversion/UpsellDrawer";
import { SmartBundle } from "@/domains/Experience/components/conversion/SmartBundle";
import { ProductIntelligenceDashboard } from "@/domains/Commerce/ui/ProductIntelligenceDashboard";
import { ScrollDepthTracker } from "@/domains/signals/observers/ScrollDepthTracker";
import { useSignals } from "@/domains/signals/sdk/hooks";

type ProductProps = {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  category: string;
  brand: string;
  image: string;
  images: string[];
  description: string;
  rating: number;
  reviewCount: number;
  sku: string;
  stock: number;
  specs: Record<string, string>;
  features: string[];
};

type RelatedProduct = {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  category: string;
  image: string;
  rating: number;
};

export function ProductClientV3({ product, relatedProducts, liveInventoryEnabled = false }: { product: ProductProps; relatedProducts?: RelatedProduct[]; liveInventoryEnabled?: boolean }) {
  const { addItem } = useCartStore();
  const { stock, connectionState, publish } = useInventory(product.id, product.stock);
  const currentStock = liveInventoryEnabled ? stock : product.stock;
  
  const [isAdding, setIsAdding] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { track } = useSignals();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    track("product.viewed", "commerce", { productId: product.id, productName: product.name, price: product.price }, true);
  }, [track, product.id, product.name, product.price]);

  const displayImages = product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = async () => {
    setIsAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.image,
      quantity: 1
    });

    if (liveInventoryEnabled && currentStock > 0) {
      await publish({
        productId: product.id,
        newStock: currentStock - 1,
        reservedCount: 0
      });
    }
    
    setTimeout(() => {
      setIsAdding(false);
      setDrawerOpen(true);
    }, 500);
  };

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <main className="min-h-screen pt-28 pb-32 relative bg-background selection:bg-accent selection:text-primary">
      <ScrollDepthTracker pageType="pdp" productId={product.id} />
      
      {/* HEADER / NAVIGATION */}
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted mb-8">
          <span className="hover:text-foreground cursor-pointer transition-colors">Home</span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-foreground cursor-pointer transition-colors">{product.category}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </div>

        {/* CSS Grid Layout: 7 Columns for Info/Gallery, 5 Columns for Sticky Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 relative">
          
          {/* LEFT COLUMN: Gallery & Info (Takes 7/12) */}
          <div className="lg:col-span-7 flex flex-col">
            
            {/* Gallery */}
            <div className="mb-10 w-full h-[50vh] md:h-[65vh]">
               <ProductGallery images={displayImages} productName={product.name} />
            </div>

            {/* Title & Reviews above the fold for mobile */}
            <div className="mb-6 lg:hidden">
               <p className="text-muted font-semibold tracking-wider uppercase text-sm mb-2">{product.brand}</p>
               <h1 className="text-3xl font-bold text-foreground mb-4 leading-tight">{product.name}</h1>
               <div className="flex items-center gap-2 text-sm text-muted">
                 <span className="flex items-center gap-1 text-warning font-medium">
                   <Star className="w-4 h-4 fill-warning text-warning" /> {product.rating}
                 </span>
                 <span>•</span>
                 <span className="underline">{product.reviewCount} Reviews</span>
               </div>
            </div>

            {/* Highlights */}
            <ProductHighlights />

            {/* Intelligence Dashboard inserted here for V3 */}
            <div className="mt-8 mb-8">
              <ProductIntelligenceDashboard productId={product.id} />
            </div>

            {/* Accordion (Specs, Description, etc.) */}
            <ProductAccordion 
              description={product.description} 
              specs={product.specs} 
              features={product.features} 
            />

          </div>

          {/* RIGHT COLUMN: Sticky Purchase Panel (Takes 5/12) */}
          <div className="lg:col-span-5 hidden lg:block">
            {/* Title is shown in the sticky column for desktop */}
            <div className="mb-6">
              <p className="text-muted font-semibold tracking-wider uppercase text-sm mb-2">{product.brand}</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">{product.name}</h1>
              <InteractiveActions />
            </div>

            {/* Sticky Panel component handles the sticky CSS and IntersectionObserver for mobile */}
            <StickyPurchasePanel 
              price={product.price}
              salePrice={product.salePrice}
              stock={currentStock}
              onAddToCart={handleAddToCart}
              isAdding={isAdding}
            />
          </div>

          {/* Mobile elements (Interactive Actions & Sticky Panel root) */}
          <div className="lg:hidden mt-6">
             <InteractiveActions />
             {/* The panel will render inline here, but trigger the fixed bottom bar when it scrolls out */}
             <StickyPurchasePanel 
              price={product.price}
              salePrice={product.salePrice}
              stock={currentStock}
              onAddToCart={handleAddToCart}
              isAdding={isAdding}
            />
          </div>
          
        </div>

        {/* FULL WIDTH SECTION: Smart Bundle */}
        <div className="mt-8 -mx-4 md:-mx-6 px-4 md:px-6">
           <SmartBundle />
        </div>

        {/* FULL WIDTH SECTION: Community Knowledge Hub (Q&A) */}
        <div className="mt-8 -mx-4 md:-mx-6">
           <CommunityQA />
        </div>

        {/* FULL WIDTH SECTION: Reviews 2.0 */}
        <div className="mt-8 -mx-4 md:-mx-6">
           <ProductReviews />
        </div>

        {/* BOTTOM SECTION: Recommendations */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-20 pt-16 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-8">Frequently Bought Together</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <Link key={rp.id} href={`/product/${rp.id}`} className="group block">
                  <div className="bg-surface p-4 rounded-2xl border border-border h-full transition-all hover:border-cta-primary/50 hover:-translate-y-1 hover:shadow-soft">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-muted/20">
                      <Image src={rp.image} alt={rp.name} fill className="object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-motion-standard" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-muted text-xs uppercase tracking-wider">{rp.category}</p>
                      <h3 className="text-foreground font-bold truncate">{rp.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-danger font-medium">
                          ${rp.salePrice ? rp.salePrice.toFixed(2) : rp.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted">
                          <Star className="w-3 h-3 text-warning fill-warning" /> {rp.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <UpsellDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      </div>
    </main>
  );
}
