"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingCart } from "lucide-react";
import { GlassCard } from "@/shared/components/ui/glass-card";
import { Button } from "@/shared/components/ui/button";

const HOTSPOTS = [
  {
    id: "h1",
    x: "25%", // percentage from left
    y: "45%", // percentage from top
    product: {
      name: "Modern Leather Sofa",
      price: "$2,499",
      brand: "Nova Living",
      image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80",
      link: "/store?category=Home"
    }
  },
  {
    id: "h2",
    x: "65%",
    y: "35%",
    product: {
      name: "Abstract Canvas Art",
      price: "$850",
      brand: "Gallery Exclusive",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80",
      link: "/store?category=Home"
    }
  },
  {
    id: "h3",
    x: "50%",
    y: "65%",
    product: {
      name: "Marble Coffee Table",
      price: "$1,200",
      brand: "Nova Living",
      image: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400&q=80",
      link: "/store?category=Home"
    }
  }
];

export function ShoppableLookbook() {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  return (
    <section className="py-24 bg-[var(--background)]">
      <div className="container mx-auto px-6 max-w-[1400px]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">Curated Living</h2>
          <p className="text-[var(--color-muted)] max-w-2xl mx-auto text-lg">
            Hover over the dots to explore the products featured in this executive space.
          </p>
        </div>

        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[var(--radius-card)] overflow-hidden shadow-2xl">
          {/* Base Image */}
          <Image 
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80" 
            alt="Luxury Living Room Lookbook" 
            fill 
            className="object-cover"
          />
          
          {/* Subtle overlay to make hotspots pop */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Hotspots */}
          {HOTSPOTS.map((hotspot) => (
            <div 
              key={hotspot.id}
              className="absolute z-20"
              style={{ left: hotspot.x, top: hotspot.y }}
              onMouseEnter={() => setActiveHotspot(hotspot.id)}
              onMouseLeave={() => setActiveHotspot(null)}
            >
              {/* The pulsing dot */}
              <div className="relative -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div className="absolute inset-0 bg-white/40 rounded-full animate-ping" />
              </div>

              {/* Product Card Popover */}
              <div 
                className={`absolute left-1/2 bottom-full mb-4 -translate-x-1/2 w-[240px] transition-all duration-300 pointer-events-none
                  ${activeHotspot === hotspot.id ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
              >
                <GlassCard className="p-3 pointer-events-auto shadow-2xl">
                  <div className="relative w-full aspect-square rounded-md overflow-hidden mb-3">
                    <Image 
                      src={hotspot.product.image} 
                      alt={hotspot.product.name} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider mb-1">{hotspot.product.brand}</p>
                  <p className="text-sm font-bold text-[var(--foreground)] truncate mb-1">{hotspot.product.name}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-bold text-[var(--color-accent)]">{hotspot.product.price}</span>
                    <Link href={hotspot.product.link}>
                      <button className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-[var(--color-background)] flex items-center justify-center hover:opacity-90 transition-opacity">
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </GlassCard>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
