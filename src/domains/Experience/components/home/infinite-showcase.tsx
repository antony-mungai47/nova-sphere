"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useAnimation, useMotionValue } from "framer-motion";

const CATEGORIES = [
  { name: "Luxury Watches", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80", link: "/store?category=Watches" },
  { name: "Rare Collectibles", image: "https://images.unsplash.com/photo-1610214644265-27663fdfbeec?w=800&q=80", link: "/store?category=Collectibles" },
  { name: "High-End Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", link: "/store?category=Electronics" },
  { name: "Designer Fashion", image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80", link: "/store?category=Fashion" },
  { name: "Curated Living", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", link: "/store?category=Home" },
  { name: "Live Auctions", image: "https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?w=800&q=80", link: "/auctions" },
];

export function InfiniteShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const controls = useAnimation();
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.scrollWidth - containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    if (!isDragging && width > 0) {
      controls.start({
        x: -width,
        transition: {
          duration: 60, // Slow, elegant movement
          ease: "linear",
          repeat: Infinity,
          repeatType: "reverse"
        }
      });
    } else {
      controls.stop();
    }
  }, [isDragging, width, controls]);

  return (
    <section className="relative w-full overflow-hidden py-20 bg-[var(--background)]">
      <div className="container mx-auto px-6 mb-10">
        <h2 className="text-4xl md:text-6xl font-black text-[var(--color-text-main)] tracking-tight mb-4">
          Discover the Extraordinary
        </h2>
        <p className="text-[var(--color-muted)] text-lg max-w-2xl">
          Explore a curated selection of world-class inventory. From hyper-rare collectibles to the latest in premium technology.
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[var(--background)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[var(--background)] to-transparent z-10 pointer-events-none" />
        
        <motion.div 
          ref={containerRef}
          className="flex cursor-grab active:cursor-grabbing px-6 md:px-12"
          drag="x"
          dragConstraints={{ right: 0, left: -width }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          animate={controls}
          style={{ x }}
        >
          {/* Duplicate categories for infinite feel */}
          {[...CATEGORIES, ...CATEGORIES].map((category, index) => (
            <Link 
              href={category.link}
              key={index} 
              className="min-w-[300px] md:min-w-[400px] h-[400px] md:h-[500px] mx-4 relative rounded-2xl overflow-hidden group"
            >
              <Image 
                src={category.image} 
                alt={category.name} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                sizes="(max-width: 768px) 300px, 400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                <div className="w-12 h-1 bg-[var(--color-accent)] transform origin-left transition-all duration-300 group-hover:w-full" />
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}