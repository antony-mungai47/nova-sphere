"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FADE_UP, STAGGER_CONTAINER } from "@/lib/animations";

interface Stats {
  products: number;
  auctions: number;
  customers: number;
  transactions: number;
}

export function LiveStatistics() {
  const [stats, setStats] = useState<Stats>({
    products: 15420,
    auctions: 342,
    customers: 89000,
    transactions: 245000,
  });

  // Simulate live growth for the effect
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        transactions: prev.transactions + Math.floor(Math.random() * 3),
        customers: prev.customers + (Math.random() > 0.8 ? 1 : 0),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  return (
    <section className="w-full bg-black border-y border-white/5 py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-nova-blue/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          variants={STAGGER_CONTAINER}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
        >
          <motion.div variants={FADE_UP} className="flex flex-col items-center text-center">
            <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 font-mono">
              {formatNumber(stats.products)}+
            </h4>
            <p className="text-nova-silver text-sm uppercase tracking-widest font-semibold">Premium Products</p>
          </motion.div>

          <motion.div variants={FADE_UP} className="flex flex-col items-center text-center">
            <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 font-mono">
              {formatNumber(stats.auctions)}
            </h4>
            <p className="text-nova-silver text-sm uppercase tracking-widest font-semibold">Active Auctions</p>
          </motion.div>

          <motion.div variants={FADE_UP} className="flex flex-col items-center text-center">
            <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 font-mono">
              {formatNumber(stats.customers)}+
            </h4>
            <p className="text-nova-silver text-sm uppercase tracking-widest font-semibold">Verified Customers</p>
          </motion.div>

          <motion.div variants={FADE_UP} className="flex flex-col items-center text-center">
            <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 font-mono flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-3" />
              {formatNumber(stats.transactions)}
            </h4>
            <p className="text-nova-silver text-sm uppercase tracking-widest font-semibold">Total Transactions</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
