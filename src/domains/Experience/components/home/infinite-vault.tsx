"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard } from "@/shared/components/ui/glass-card";

const VAULT_ITEMS = [
  {
    id: "v1",
    name: "Rolex Daytona Platinum",
    brand: "Rolex",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80",
    link: "/store?category=Watches"
  },
  {
    id: "v2",
    name: "Leica M11 Camera",
    brand: "Leica",
    image: "https://images.unsplash.com/photo-1516961642265-531546e84af2?w=400&q=80",
    link: "/store?category=Electronics"
  },
  {
    id: "v3",
    name: "Ming Dynasty Vase",
    brand: "Antiquity",
    image: "https://images.unsplash.com/photo-1610214644265-27663fdfbeec?w=400&q=80",
    link: "/store?category=Collectibles"
  },
  {
    id: "v4",
    name: "Hermès Birkin 35",
    brand: "Hermès",
    image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=400&q=80",
    link: "/store?category=Fashion"
  },
  {
    id: "v5",
    name: "Macallan 1926",
    brand: "Macallan",
    image: "https://images.unsplash.com/photo-1569937718301-8b012c46e339?w=400&q=80",
    link: "/store?category=Collectibles"
  }
];

export function InfiniteVault() {
  // Duplicate array for seamless infinite scroll
  const items = [...VAULT_ITEMS, ...VAULT_ITEMS, ...VAULT_ITEMS];

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Vault lighting effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-nova-amber/5 blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 mb-12 text-center relative z-10">
        <h2 className="text-sm font-bold text-[var(--color-accent)] tracking-[0.3em] uppercase mb-4">The Nova Vault</h2>
        <p className="text-[var(--foreground)] text-3xl md:text-4xl font-bold">
          Hyper-Rare & Exclusive Collectibles
        </p>
      </div>

      <div className="relative w-full flex overflow-hidden">
        {/* Edge Gradients for fading out the marquee */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />
        
        <motion.div 
          className="flex gap-8 px-4"
          animate={{ x: ["0%", "-33.333333%"] }}
          transition={{ ease: "linear", duration: 40, repeat: Infinity }}
        >
          {items.map((item, idx) => (
            <Link key={`${item.id}-${idx}`} href={item.link} className="group block shrink-0 w-[280px]">
              <GlassCard className="p-4 bg-white/5 border-white/10 hover:border-[var(--color-accent)]/50 transition-colors h-[380px] flex flex-col justify-between">
                <div className="relative w-full h-[240px] rounded-sm overflow-hidden bg-black/50 flex items-center justify-center">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    width={200}
                    height={200}
                    className="object-contain group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-50" />
                </div>
                <div className="pt-4 text-center">
                  <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-widest mb-1">{item.brand}</p>
                  <p className="text-white font-medium truncate group-hover:text-[var(--color-accent)] transition-colors">{item.name}</p>
                </div>
              </GlassCard>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
