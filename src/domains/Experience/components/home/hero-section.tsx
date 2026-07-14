"use client";

import React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ShoppingBag, TrendingUp, Zap, Truck } from "lucide-react";

export function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -150]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -250]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20">
      {/* Background Soft Glows (Light Theme) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cta-secondary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cta-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center h-full">
        
        {/* Left Content */}
        <motion.div 
          className="space-y-8 max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }} // Motion token mapping
        >
          <motion.div 
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-cta-secondary/20 bg-cta-secondary/5 text-cta-secondary text-sm font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <span className="w-2 h-2 rounded-full bg-cta-secondary animate-pulse" />
            <span>The 2026 Premium Marketplace</span>
          </motion.div>

          <h1 className="text-display md:text-7xl font-hero font-bold tracking-tight text-foreground leading-tight">
            Shop Smarter. <br/>
            Sell Faster.
          </h1>

          <div className="flex items-center space-x-6 text-muted font-medium">
            <div className="flex flex-col">
              <span className="text-2xl text-foreground font-bold">20,000+</span>
              <span className="text-sm">Products</span>
            </div>
            <div className="w-px h-10 bg-border"></div>
            <div className="flex flex-col">
              <span className="text-2xl text-foreground font-bold">1,200+</span>
              <span className="text-sm">Vendors</span>
            </div>
            <div className="w-px h-10 bg-border"></div>
            <div className="flex flex-col">
              <span className="text-2xl text-success font-bold">98%</span>
              <span className="text-sm">Satisfaction</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 pt-6">
            <Link href="/store">
              <Button size="lg" variant="primary" rightIcon={<ShoppingBag size={18}/>}>
                Shop Now
              </Button>
            </Link>
            <Link href="/vendor/apply">
              <Button size="lg" variant="outline">
                Become a Seller
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Right Content - Parallax Floating Cards */}
        <motion.div 
          className="relative h-[600px] w-full hidden lg:flex items-center justify-center"
          style={{ opacity }}
        >
          {/* Main central focal element */}
          <motion.div
            style={{ y: y1 }}
            className="absolute z-20 w-72 h-96 bg-surface rounded-card shadow-hover border border-border p-6 flex flex-col justify-end"
          >
            <div className="w-full h-48 bg-muted/10 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-muted text-sm">Product Image</span>
            </div>
            <h3 className="font-heading font-bold text-lg text-foreground">Premium Wireless Headphones</h3>
            <p className="text-cta-primary font-bold mt-2">$299.00</p>
          </motion.div>

          {/* Floating Badges */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-10 z-30 bg-surface rounded-full px-4 py-2 shadow-soft border border-border flex items-center space-x-2"
          >
            <Zap className="text-warning w-5 h-5" />
            <span className="font-medium text-sm text-foreground">Flash Deals</span>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 right-10 z-30 bg-surface rounded-full px-4 py-2 shadow-soft border border-border flex items-center space-x-2"
          >
            <Truck className="text-cta-secondary w-5 h-5" />
            <span className="font-medium text-sm text-foreground">Free Delivery</span>
          </motion.div>

          {/* Background Parallax Cards */}
          <motion.div
            style={{ y: y2 }}
            className="absolute top-20 right-0 z-10 w-48 h-64 bg-surface rounded-card shadow-soft border border-border/50 scale-90 blur-[1px] opacity-70"
          />
          <motion.div
            style={{ y: y2 }}
            className="absolute bottom-0 left-0 z-10 w-56 h-72 bg-surface rounded-card shadow-soft border border-border/50 scale-95 blur-[2px] opacity-60"
          />

        </motion.div>

      </div>
    </section>
  );
}
