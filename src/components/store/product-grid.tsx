"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Filter, Star, Heart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { AnimatedButton } from "@/components/ui/animated-button";
import { toggleWishlist } from "@/app/actions/wishlist";

type ProductImage = { url: string; isPrimary: boolean };

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

export const ProductGrid = ({ initialProducts }: { initialProducts: ProductProps[] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("featured");
  
  const addItem = useCartStore((state) => state.addItem);

  // Extract unique categories and brands
  const categories = ["All", ...Array.from(new Set(initialProducts.map((p) => p.category)))];
  const brands = ["All", ...Array.from(new Set(initialProducts.map((p) => p.brand)))];

  const filteredAndSortedProducts = useMemo(() => {
    let result = initialProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesBrand = selectedBrand === "All" || product.brand === selectedBrand;
      return matchesSearch && matchesCategory && matchesBrand;
    });

    // Sorting
    switch (sortBy) {
      case "price-low":
        result = result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case "price-high":
        result = result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case "rating":
        result = result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        // Assuming the initial products are already ordered by newest from the server
        break;
      default:
        // featured
        break;
    }

    return result;
  }, [initialProducts, searchQuery, selectedCategory, selectedBrand, sortBy]);

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

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar (Desktop) */}
      <div className="hidden lg:block w-64 flex-shrink-0 space-y-8">
        <div>
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </h3>
          <div className="space-y-6">
            {/* Search */}
            <div>
              <label className="text-nova-silver text-xs uppercase tracking-wider mb-2 block">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 text-nova-silver absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Find tech..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-nova-silver/50 focus:outline-none focus:border-nova-blue transition-colors"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-nova-silver text-xs uppercase tracking-wider mb-2 block">Category</label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategory === category ? 'bg-nova-blue border-nova-blue' : 'border-white/20 group-hover:border-white/40'}`}>
                      {selectedCategory === category && <div className="w-2 h-2 bg-white rounded-sm" />}
                    </div>
                    <span className={`text-sm transition-colors ${selectedCategory === category ? 'text-white font-medium' : 'text-nova-silver group-hover:text-white/80'}`}>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="text-nova-silver text-xs uppercase tracking-wider mb-2 block">Brand</label>
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
                {brands.map((brand) => (
                  <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedBrand === brand ? 'bg-nova-blue border-nova-blue' : 'border-white/20 group-hover:border-white/40'}`}>
                      {selectedBrand === brand && <div className="w-2 h-2 bg-white rounded-sm" />}
                    </div>
                    <span className={`text-sm transition-colors ${selectedBrand === brand ? 'text-white font-medium' : 'text-nova-silver group-hover:text-white/80'}`}>{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Mobile Search/Filter Toggle (Simplified for now) */}
        <div className="lg:hidden mb-6 space-y-4">
           <div className="relative">
              <Search className="w-4 h-4 text-nova-silver absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search the sphere..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-nova-blue transition-colors"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-sm rounded-xl border whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? "bg-nova-blue/20 border-nova-blue text-white"
                      : "bg-white/5 border-white/10 text-nova-silver"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
        </div>

        {/* Top Bar (Results count & Sort) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <p className="text-nova-silver">Showing <span className="text-white font-bold">{filteredAndSortedProducts.length}</span> results</p>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-nova-silver">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-nova-blue appearance-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-white/5 rounded-3xl bg-white/5">
            <div className="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Filter className="w-8 h-8 text-nova-silver opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No matching signals found.</h3>
            <p className="text-nova-silver">Try adjusting your filters to locate other tech.</p>
            <AnimatedButton 
              variant="outline" 
              className="mt-6"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedBrand("All");
              }}
            >
              Clear All Filters
            </AnimatedButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredAndSortedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/product/${product.id}`} className="block group h-full">
                    <div className="glass-panel p-5 rounded-3xl h-full border border-white/10 hover:border-nova-blue/30 transition-all duration-500 relative flex flex-col bg-black/40">
                      
                      {/* Wishlist Button */}
                      <button 
                        onClick={(e) => handleWishlist(product, e)}
                        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-nova-silver hover:text-red-400 hover:border-red-400/50 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                      </button>

                      {/* Sale Badge */}
                      {product.salePrice && (
                        <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-nova-amber/20 border border-nova-amber/30 text-nova-amber text-xs font-bold tracking-wider">
                          SALE
                        </div>
                      )}

                      <div className="relative w-full aspect-square mb-5 rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center p-6">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-nova-silver text-xs font-bold uppercase tracking-wider">{product.brand}</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-nova-amber text-nova-amber" />
                            <span className="text-xs text-white font-medium">{product.rating}</span>
                            <span className="text-xs text-nova-silver">({product.reviewCount})</span>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-nova-blue transition-colors">{product.name}</h3>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
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
                            onClick={(e) => handleAddToCart(product, e)}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-nova-blue hover:border-nova-blue shadow-[0_0_15px_rgba(59,130,246,0)] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all z-10"
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
