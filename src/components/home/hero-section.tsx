"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/animated-button";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-nova-blue/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-nova-amber/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <motion.div 
          className="space-y-8 max-w-2xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-nova-blue/30 bg-nova-blue/10 text-nova-blue text-sm font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="w-2 h-2 rounded-full bg-nova-blue animate-pulse" />
            <span>Next-Gen Commerce</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            Explore the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-nova-blue to-cyan-300">
              Future of Smart
            </span> <br/>
            Shopping
          </h1>

          <p className="text-lg text-nova-silver max-w-xl leading-relaxed">
            NOVA SPHERE is an ultra-premium, AI-powered marketplace. Discover the most advanced gadgets, wearables, and lifestyle tech curated from around the globe.
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
            <Link href="/store">
              <AnimatedButton glow={true}>
                Shop Now
              </AnimatedButton>
            </Link>
            <Link href="/store?sort=trending">
              <AnimatedButton variant="outline">
                Trending Products
              </AnimatedButton>
            </Link>
          </div>
        </motion.div>

        {/* Right Content - 3D Floating Product Image */}
        <motion.div 
          className="relative h-[500px] md:h-[600px] w-full flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-[80%] h-[80%] z-20"
            style={{ filter: "drop-shadow(var(--shadow-glow-primary))" }}
          >
            <Image
              src="/hero-product.png"
              alt="Futuristic Headphone"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
          
          {/* Decorative rings behind product */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
              className="w-[300px] h-[300px] rounded-full border border-white/5"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute w-[450px] h-[450px] rounded-full border border-nova-blue/10 border-dashed"
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
