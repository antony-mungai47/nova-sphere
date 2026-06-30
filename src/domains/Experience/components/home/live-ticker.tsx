"use client";

import React from "react";
import { motion } from "framer-motion";

const TICKER_ITEMS = [
  "🔥 Anonymous placed a bid of $5,200 on Rolex Submariner",
  "⚡ Astro A50 sold out in 4 minutes",
  "💎 New arrival: Original 'Girl with Balloon' by Banksy",
  "🚀 Marketplace Milestone: 10,000 verified transactions",
  "🔥 Trending Now: Smart Watch Elite",
  "💎 Premium Collection 'Modern Living' just dropped"
];

export function LiveTicker() {
  return (
    <div className="w-full bg-[var(--surface)] border-b border-[var(--glass-border)] py-2 overflow-hidden flex items-center relative">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--surface)] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--surface)] to-transparent z-10" />
      
      <motion.div 
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: 30, repeat: Infinity }}
      >
        {/* Duplicate items to create seamless loop */}
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => (
          <div key={index} className="flex items-center mx-8 text-sm font-medium text-[var(--color-muted)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mr-3 opacity-50 animate-pulse" />
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
