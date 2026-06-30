"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    title: "Consumer Technology",
    subtitle: "The Future, Engineered.",
    description: "Discover precision-crafted devices designed to elevate your daily workflow.",
    image: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=1600&q=80",
    link: "/store?category=Electronics",
    color: "from-blue-900/80"
  },
  {
    id: 2,
    title: "Luxury Timepieces",
    subtitle: "Masterpieces of Horology.",
    description: "Invest in legacy. Explore our curated selection of verified premium watches.",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1600&q=80",
    link: "/auctions",
    color: "from-amber-900/80"
  },
  {
    id: 3,
    title: "Premium Home",
    subtitle: "Architectural Aesthetics.",
    description: "Transform your living space with minimalist, high-end decor and smart furniture.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80",
    link: "/store?category=Home",
    color: "from-slate-900/80"
  }
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-black flex items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={SLIDES[current].image}
            alt={SLIDES[current].title}
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${SLIDES[current].color} to-transparent mix-blend-multiply`} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${current}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="inline-block text-nova-silver tracking-[0.2em] text-sm font-semibold uppercase mb-4 border-l-2 border-[var(--color-primary)] pl-3">
                {SLIDES[current].title}
              </span>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                {SLIDES[current].subtitle}
              </h1>
              <p className="text-lg md:text-xl text-nova-silver mb-8 max-w-lg font-light leading-relaxed">
                {SLIDES[current].description}
              </p>
              
              <Link href={SLIDES[current].link} className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-[var(--radius-button)] font-semibold hover:bg-nova-silver transition-colors">
                Explore Collection
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Manual Controls & Progress */}
      <div className="absolute bottom-12 right-6 md:right-12 z-20 flex flex-col items-end gap-6">
        <div className="flex gap-4">
          <button 
            onClick={prevSlide}
            className="w-12 h-12 rounded-full border border-white/20 glass-panel flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="w-12 h-12 rounded-full border border-white/20 glass-panel flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        <div className="flex gap-2">
          {SLIDES.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1 transition-all duration-500 rounded-full ${idx === current ? "w-12 bg-white" : "w-4 bg-white/30"}`} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}