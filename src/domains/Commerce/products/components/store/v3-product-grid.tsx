"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Filter, Star, Heart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/shared/components/ui/button";
import { toggleWishlist } from "@/domains/Customer/wishlist/actions";

type ProductProps = {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  category: string;
  brand: string;
  image: string;
  description: string;
  rating: number;
  reviewCount: number;
};

export const ProductGridV3 = ({ 
  initialProducts, 
  uniqueCategories, 
  uniqueBrands 
}: { 
  initialProducts: ProductProps[], 
  uniqueCategories: string[], 
  uniqueBrands: string[] 
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "All");
  const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get("brand") || "All");
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "newest");
  
  const [minPrice, setMinPrice] = useState<string>(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get("maxPrice") || "");
  
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (searchQuery) params.set("q", searchQuery);
      else params.delete("q");
      
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      else params.delete("category");

      if (selectedBrand !== "All") params.set("brand", selectedBrand);
      else params.delete("brand");

      if (sortBy !== "newest") params.set("sort", sortBy);
      else params.delete("sort");

      if (minPrice) params.set("minPrice", minPrice);
      else params.delete("minPrice");

      if (maxPrice) params.set("maxPrice", maxPrice);
      else params.delete("maxPrice");

      router.push(`/store?${params.toString()}`, { scroll: false });
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery, selectedCategory, selectedBrand, sortBy, minPrice, maxPrice, router, searchParams]);

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

  const handleWishlist = async (product: ProductProps, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleWishlist(product.id);
    } catch (error) {
      console.error(error);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedBrand("All");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 shrink-0 space-y-8">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-nova-blue" /> Filters
            </h3>
            <button onClick={clearFilters} className="text-xs text-nova-silver hover:text-white transition-colors">
              Clear All
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-nova-silver mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nova-silver" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find products..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-nova-silver/50 focus:outline-none focus:border-nova-blue transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-nova-silver mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-nova-blue transition-colors appearance-none"
              >
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-nova-silver mb-2">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-nova-blue transition-colors appearance-none"
              >
                {uniqueBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-nova-silver mb-2">Price Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-sm text-white placeholder-nova-silver/50 focus:outline-none focus:border-nova-blue transition-colors"
                />
                <span className="text-nova-silver">-</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-3 text-sm text-white placeholder-nova-silver/50 focus:outline-none focus:border-nova-blue transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Grid Area */}
      <div className="flex-1">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <p className="text-nova-silver text-sm">
            Showing <span className="text-white font-bold">{initialProducts.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-nova-silver">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-nova-blue transition-colors appearance-none"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {initialProducts.length === 0 ? (
          <div className="glass-panel py-20 text-center rounded-2xl border-dashed border-2 border-white/10">
            <Search className="w-12 h-12 text-nova-silver mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
            <p className="text-nova-silver mb-6">Try adjusting your filters or search query.</p>
            <Button variant="secondary" onClick={clearFilters}>Clear All Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {initialProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/product/${product.id}`} className="group block h-full">
                    <div className="glass-panel glass-panel-glow h-full flex flex-col overflow-hidden rounded-2xl relative transition-transform duration-motion-standard group-hover:-translate-y-1">
                      
                      {/* Image container */}
                      <div className="relative aspect-square bg-white/5 p-6 flex items-center justify-center overflow-hidden">
                        <Image 
                          src={product.image} 
                          alt={product.name} 
                          fill 
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-motion-slow" 
                        />
                        
                        {/* Tags */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.salePrice && (
                            <span className="bg-nova-amber text-black text-xs font-bold px-2 py-1 rounded shadow-lg">
                              SALE
                            </span>
                          )}
                        </div>

                        {/* Actions Overlay */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-motion-standard">
                          <button 
                            onClick={(e) => handleWishlist(product, e)}
                            className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-nova-emerald transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3 h-3 text-nova-amber fill-nova-amber" />
                          <span className="text-xs font-bold text-white">{product.rating.toFixed(1)}</span>
                          <span className="text-xs text-nova-silver">({product.reviewCount})</span>
                        </div>
                        
                        <h3 className="text-sm font-bold text-white mb-1 line-clamp-2 group-hover:text-nova-blue transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-nova-silver mb-4">{product.brand}</p>
                        
                        <div className="mt-auto flex items-end justify-between">
                          <div>
                            {product.salePrice ? (
                              <div className="flex flex-col">
                                <span className="text-xs text-nova-silver line-through">${product.price.toFixed(2)}</span>
                                <span className="text-lg font-bold text-nova-amber">${product.salePrice.toFixed(2)}</span>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-white">${product.price.toFixed(2)}</span>
                            )}
                          </div>
                          
                          <button 
                            onClick={(e) => handleAddToCart(product, e)}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-nova-blue group-hover:border-nova-blue transition-colors"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
