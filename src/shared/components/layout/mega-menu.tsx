"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";

const CATEGORIES = [
  { name: "Luxury Watches", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400" },
  { name: "Smart Home", image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=400" },
  { name: "Mobile Devices", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400" },
  { name: "Audio", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400" },
];

const SECONDARY_CATEGORIES = [
  "Gaming", "Home Office", "Lifestyle Tech", "Fitness", "Premium Accessories", "Consumer Electronics"
];

export const MegaMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative group h-full flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="text-sm font-medium text-white/70 group-hover:text-white transition-colors relative flex items-center gap-1">
        Categories
        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180 text-nova-blue' : ''}`} />
        <span className="absolute -bottom-6 left-0 w-full h-6 bg-transparent" /> {/* invisible hover bridge */}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[calc(100%+1.5rem)] left-1/2 -translate-x-1/2 w-[800px] glass-panel border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex z-50 bg-black/80 backdrop-blur-xl"
          >
            {/* Primary Visual Categories */}
            <div className="w-2/3 p-8 bg-white/5 border-r border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-lg">Featured Collections</h3>
                <Link href="/store" className="text-nova-blue text-sm flex items-center gap-1 hover:text-white transition-colors">
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map((cat) => (
                  <Link href={`/store?category=${encodeURIComponent(cat.name)}`} key={cat.name} className="group/item relative rounded-xl overflow-hidden aspect-[4/3] flex items-end p-4 border border-white/10 hover:border-nova-blue/50 transition-all">
                    <Image src={cat.image} alt={cat.name} fill className="object-cover opacity-50 group-hover/item:scale-110 group-hover/item:opacity-80 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <span className="relative z-10 text-white font-bold tracking-wide group-hover/item:text-nova-blue transition-colors text-sm">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Secondary Links */}
            <div className="w-1/3 p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-nova-silver font-bold text-xs uppercase tracking-widest mb-6">Explore More</h3>
                <div className="flex flex-col gap-4">
                  {SECONDARY_CATEGORIES.map((cat) => (
                    <Link key={cat} href={`/store?category=${encodeURIComponent(cat)}`} className="text-white/70 text-sm hover:text-white hover:translate-x-1 transition-all flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-nova-blue/50" />
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10">
                <Link href="/store?trending=true" className="flex items-center gap-3 group/trend">
                  <div className="w-10 h-10 rounded-full bg-nova-amber/10 flex items-center justify-center border border-nova-amber/20 group-hover/trend:bg-nova-amber/20 transition-colors">
                    <span className="text-nova-amber text-lg leading-none">🔥</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Trending Now</p>
                    <p className="text-nova-silver text-xs group-hover/trend:text-white transition-colors">See what's popular</p>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
