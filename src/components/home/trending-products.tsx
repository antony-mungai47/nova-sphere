"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Heart } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useCartStore } from "@/store/useCartStore";

type ProductProps = {
  id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  image: string;
  description: string;
  salePrice: number | null;
  rating: number;
  reviewCount: number;
};

export const TrendingProducts = ({ initialProducts }: { initialProducts: ProductProps[] }) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (product: ProductProps, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.image,
      quantity: 1,
    });
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-nova-blue/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-nova-amber/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-nova-blue to-nova-amber">Now</span>
            </h2>
            <p className="text-nova-silver text-lg">
              Discover the most sought-after tech shaping the future. Handpicked selections for the visionaries.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 md:mt-0"
          >
            <AnimatedButton variant="outline" glow={true} className="px-8 py-3 text-sm">
              View All Collection
            </AnimatedButton>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {initialProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard className="h-full group hover:glass-panel-glow transition-all duration-300 p-4 flex flex-col cursor-pointer">
                <Link href={`/product/${product.id}`} className="block flex-1 flex flex-col">
                  <div className="relative w-full aspect-square mb-4 bg-black/20 rounded-xl overflow-hidden flex items-center justify-center">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    />
                    
                    {/* Sale Badge */}
                    {product.salePrice && (
                      <div className="absolute top-3 left-3 z-20 px-2 py-0.5 rounded-full bg-nova-amber/20 border border-nova-amber/30 text-nova-amber text-[10px] font-bold tracking-wider">
                        SALE
                      </div>
                    )}
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      className="absolute top-3 right-3 text-white/50 hover:text-nova-amber transition-colors z-10"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                    {/* Overlay Quick Action */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                      <AnimatedButton 
                        variant="primary" 
                        glow={false} 
                        className="px-6 py-2 scale-90 group-hover:scale-100 transition-transform"
                        onClick={(e) => { e.preventDefault(); handleAddToCart(product, e); }}
                      >
                        Quick Add
                      </AnimatedButton>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-nova-silver font-medium mb-1 uppercase tracking-wider">{product.brand}</p>
                      <h3 className="text-lg font-semibold text-white leading-tight mb-2 group-hover:text-nova-blue transition-colors line-clamp-1">{product.name}</h3>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex flex-col">
                        {product.salePrice ? (
                          <>
                            <span className="text-xs text-nova-silver line-through">${product.price.toFixed(2)}</span>
                            <span className="text-xl font-bold text-nova-amber">${product.salePrice.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-white">${product.price.toFixed(2)}</span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => { e.preventDefault(); handleAddToCart(product, e); }}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-nova-blue hover:text-white text-nova-silver flex items-center justify-center transition-colors z-10 relative"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

