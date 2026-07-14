"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Eye, BarChart2 } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import { useFlyToCart } from "@/components/motion/FlyToCartEngine";

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  image: string;
  images?: string[];
  category: string;
  brand: string;
  rating?: number;
  reviewCount?: number;
}

export function ProductCard({
  id,
  name,
  price,
  salePrice,
  image,
  images = [],
  category,
  brand,
  rating = 0,
  reviewCount = 0,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { triggerFlyToCart } = useFlyToCart();

  const displayImages = images.length > 0 ? images : [image];

  // Auto-slide images on hover
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && displayImages.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
      }, 1500);
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, displayImages.length]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerFlyToCart(displayImages[currentImageIndex], e);
  };

  return (
    <motion.div
      whileHover={{ y: -5, rotateX: 2, rotateY: 2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="h-full"
    >
      <Card 
        className="group relative flex flex-col h-full overflow-hidden border border-border bg-surface transition-all duration-300"
      >
        {/* Soft Hover Lighting (Spotlight) */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"
          style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 60%)" }}
        />

        {/* Discount Badge */}
        {salePrice && (
          <div className="absolute top-4 left-4 z-20 bg-danger text-white text-xs font-bold px-2 py-1 rounded-full shadow-soft">
            -{Math.round(((price - salePrice) / price) * 100)}%
          </div>
        )}

        {/* Wishlist Button (Heart Explosion) */}
        <motion.button
          onClick={toggleWishlist}
          whileTap={{ scale: 0.8 }}
          className="absolute top-4 right-4 z-20 w-8 h-8 bg-surface/80 backdrop-blur-md border border-border rounded-full flex items-center justify-center text-muted hover:text-danger hover:border-danger transition-colors overflow-hidden"
          aria-label="Toggle Wishlist"
        >
          <motion.div
            initial={false}
            animate={isWishlisted ? { scale: [1, 1.8, 1], rotate: [0, -15, 15, 0] } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.6 }}
          >
            <Heart size={16} className={isWishlisted ? "fill-danger text-danger" : ""} />
          </motion.div>
        </motion.button>

        {/* Image Gallery */}
        <Link href={`/product/${id}`} className="relative h-56 w-full bg-muted/5 flex items-center justify-center overflow-hidden z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: isHovered ? 1.05 : 1,
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative w-full h-full"
            >
              <Image
                src={displayImages[currentImageIndex]}
                alt={name}
                fill
                className="object-contain p-4 mix-blend-multiply"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.div>
          </AnimatePresence>

          {/* Quick Actions (Slide up on hover) */}
          <motion.div 
            className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ y: 20 }}
            animate={{ y: isHovered ? 0 : 20 }}
          >
            <Button variant="surface" size="sm" className="bg-surface/90 backdrop-blur border-border text-foreground hover:bg-surface shadow-soft" onClick={(e) => { e.preventDefault(); }}>
              <Eye size={16} className="mr-2" /> Quick View
            </Button>
            <Button variant="surface" size="icon" className="bg-surface/90 backdrop-blur border-border text-foreground hover:bg-surface shadow-soft w-8 h-8" onClick={(e) => { e.preventDefault(); }}>
              <BarChart2 size={16} />
            </Button>
          </motion.div>
        </Link>

        {/* Product Details */}
        <div className="p-5 flex flex-col flex-grow relative z-10">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">{brand}</p>
            <div className="flex items-center text-xs text-muted">
              <span className="text-warning mr-1">★</span>
              <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
              <span className="ml-1">({reviewCount})</span>
            </div>
          </div>

          <Link href={`/product/${id}`} className="group-hover:text-cta-primary transition-colors">
            <h3 className="font-heading font-semibold text-foreground text-sm line-clamp-2 leading-tight mb-2">
              {name}
            </h3>
          </Link>

          <div className="mt-auto pt-4 flex items-end justify-between">
            <div>
              {salePrice ? (
                <div className="flex flex-col">
                  <span className="text-muted text-sm line-through">${price.toFixed(2)}</span>
                  <span className="text-lg font-bold text-danger">${salePrice.toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-lg font-bold text-foreground">${price.toFixed(2)}</span>
              )}
            </div>

            {/* Add to Cart Microinteraction */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-muted/10 text-foreground flex items-center justify-center hover:bg-cta-primary hover:text-white transition-colors shadow-sm"
              aria-label="Add to cart"
              onClick={handleAddToCart}
            >
              <ShoppingCart size={18} />
            </motion.button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
