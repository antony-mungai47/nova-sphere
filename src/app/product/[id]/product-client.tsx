"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, Star, StarHalf, ChevronRight, Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { toggleWishlist } from "@/domains/Customer/wishlist/actions";

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

export function ProductClient({ product, relatedProducts }: { product: ProductProps; relatedProducts?: RelatedProduct[] }) {
  const { addItem } = useCartStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"features" | "specs" | "reviews">("features");

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.image,
      quantity: 1
    });
  };

  const handleToggleWishlist = async () => {
    try {
      await toggleWishlist(product.id);
      // We could add a local toast notification here
    } catch (e) {
      console.error(e);
      // Probably not logged in
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-nova-amber text-nova-amber" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} className="w-4 h-4 fill-nova-amber text-nova-amber" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-nova-silver/50" />);
      }
    }
    return stars;
  };

  return (
    <main className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-nova-blue/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-nova-amber/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-nova-silver mb-8">
          <span className="hover:text-white cursor-pointer transition-colors">Store</span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-white cursor-pointer transition-colors">{product.category}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white font-medium">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Image Gallery Stage */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full aspect-square rounded-3xl glass-panel border border-white/10 flex items-center justify-center overflow-hidden bg-black/40 group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent z-0" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImageIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 w-4/5 h-4/5"
                >
                  <Image
                    src={product.images[activeImageIndex] || product.image}
                    alt={product.name}
                    fill
                    className="object-contain drop-shadow-[0_20px_50px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-700 cursor-zoom-in"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Sale Badge */}
              {product.salePrice && (
                <div className="absolute top-6 left-6 z-20 px-4 py-2 rounded-full bg-nova-amber/20 border border-nova-amber/30 text-nova-amber font-bold tracking-wider shadow-lg backdrop-blur-md">
                  SALE
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white/5 ${
                      activeImageIndex === idx ? "border-nova-blue opacity-100" : "border-white/10 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-1/2 flex flex-col"
          >
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-nova-silver font-semibold tracking-wider uppercase text-sm">{product.brand}</p>
                <p className="text-nova-silver text-xs">SKU: {product.sku}</p>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {renderStars(product.rating)}
                </div>
                <span className="text-white font-medium">{product.rating}</span>
                <span className="text-nova-silver underline hover:text-white cursor-pointer transition-colors">
                  {product.reviewCount} Reviews
                </span>
              </div>

              <div className="flex items-end gap-4 mb-6">
                {product.salePrice ? (
                  <>
                    <span className="text-4xl font-bold text-nova-amber">${product.salePrice.toFixed(2)}</span>
                    <span className="text-xl text-nova-silver line-through mb-1">${product.price.toFixed(2)}</span>
                    <span className="text-sm text-green-400 font-medium mb-2 border border-green-400/20 bg-green-400/10 px-2 py-0.5 rounded">
                      Save ${(product.price - product.salePrice).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-white">${product.price.toFixed(2)}</span>
                )}
              </div>
            </div>

            <p className="text-nova-silver/90 text-lg leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-medium">Availability:</span>
                {product.stock > 0 ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> In Stock ({product.stock})
                  </span>
                ) : (
                  <span className="text-red-400">Out of Stock</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-12">
              <Button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 text-lg py-4 shadow-[0_0_30px_rgba(59,130,246,0.2)] flex items-center justify-center gap-3"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <button 
                onClick={handleToggleWishlist}
                className="w-16 h-16 rounded-2xl glass-panel border border-white/10 flex items-center justify-center text-nova-silver hover:text-red-400 hover:border-red-400/50 hover:bg-red-400/10 transition-all shadow-lg"
              >
                <Heart className="w-6 h-6" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 p-6 glass-panel rounded-2xl border border-white/10 bg-white/5">
              <div className="flex flex-col items-center justify-center text-center gap-2">
                <ShieldCheck className="w-6 h-6 text-nova-blue" />
                <span className="text-xs text-white/80 font-medium">2-Year Warranty</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center gap-2">
                <Truck className="w-6 h-6 text-nova-blue" />
                <span className="text-xs text-white/80 font-medium">Free Global Shipping</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center gap-2">
                <RotateCcw className="w-6 h-6 text-nova-blue" />
                <span className="text-xs text-white/80 font-medium">30-Day Returns</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-24">
          <div className="flex items-center justify-center gap-8 border-b border-white/10 pb-4 mb-12">
            {(["features", "specs", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-lg font-bold capitalize transition-colors relative ${
                  activeTab === tab ? "text-nova-blue" : "text-nova-silver hover:text-white"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="tabIndicator" className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-nova-blue" />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              {activeTab === "features" && (
                <motion.div
                  key="features"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8"
                >
                  {product.features && product.features.length > 0 ? product.features.map((feature, idx) => (
                    <div key={idx} className="flex gap-4 p-6 glass-panel rounded-2xl border border-white/5 bg-white/5">
                      <div className="w-10 h-10 rounded-full bg-nova-blue/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Check className="w-5 h-5 text-nova-blue" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg mb-2">Premium Feature {idx + 1}</h4>
                        <p className="text-nova-silver leading-relaxed">{feature}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-nova-silver col-span-2 text-center py-12">No specific features listed for this product.</p>
                  )}
                </motion.div>
              )}

              {activeTab === "specs" && (
                <motion.div
                  key="specs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-3xl mx-auto"
                >
                  <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden bg-black/40">
                    {product.specs && Object.keys(product.specs).length > 0 ? (
                      Object.entries(product.specs).map(([key, value], idx) => (
                        <div key={key} className={`flex items-center p-6 ${idx !== Object.keys(product.specs).length - 1 ? 'border-b border-white/5' : ''}`}>
                          <div className="w-1/3 text-nova-silver font-medium">{key}</div>
                          <div className="w-2/3 text-white">{value}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center text-nova-silver">Detailed specifications are not available for this product.</div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex flex-col md:flex-row gap-12">
                    {/* Review Summary */}
                    <div className="w-full md:w-1/3 glass-panel p-8 rounded-3xl border border-white/10 h-fit">
                      <h3 className="text-xl font-bold text-white mb-6">Customer Reviews</h3>
                      <div className="flex items-center gap-4 mb-6">
                        <span className="text-6xl font-bold text-white">{product.rating}</span>
                        <div>
                          <div className="flex gap-1 mb-1">{renderStars(product.rating)}</div>
                          <p className="text-nova-silver text-sm">Based on {product.reviewCount} reviews</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">Write a Review</Button>
                    </div>

                    {/* Review List (Mock for now until we load real reviews from DB) */}
                    <div className="w-full md:w-2/3 space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-nova-blue/20 flex items-center justify-center text-nova-blue font-bold">
                                {String.fromCharCode(64 + i)}
                              </div>
                              <div>
                                <p className="text-white font-medium">Verified Customer</p>
                                <div className="flex gap-1 mt-1">{renderStars(5)}</div>
                              </div>
                            </div>
                            <span className="text-nova-silver text-sm">2 days ago</span>
                          </div>
                          <h4 className="text-white font-bold mb-2">Exceeded all expectations</h4>
                          <p className="text-nova-silver">
                            This product completely transformed my setup. The build quality is phenomenal and it works flawlessly with the rest of my ecosystem. Highly recommended for anyone looking to upgrade!
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-32">
            <h2 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <a key={rp.id} href={`/product/${rp.id}`} className="group block">
                  <div className="glass-panel p-4 rounded-2xl border border-white/5 h-full transition-all hover:border-nova-slate/50 hover:-translate-y-1">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-white/5">
                      <Image src={rp.image} alt={rp.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-nova-silver text-xs uppercase tracking-wider">{rp.category}</p>
                      <h3 className="text-white font-bold truncate">{rp.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-nova-gold font-medium">
                          ${rp.salePrice ? rp.salePrice.toFixed(2) : rp.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-nova-silver">
                          <Star className="w-3 h-3 text-nova-gold fill-nova-gold" /> {rp.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
