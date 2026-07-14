"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export function HeroCards() {
  const cards = [
    {
      id: 1,
      image: "/hero-product.png",
      title: "Vision Pro Max",
      price: "$1,299",
      delay: 0,
      orbit: { x: [0, -10, 5, 0], y: [0, -15, 10, 0] }
    },
    {
      id: 2,
      image: "/hero-product.png",
      title: "Aero Headphones",
      price: "$349",
      delay: 0.2,
      orbit: { x: [0, 15, -5, 0], y: [0, 10, -15, 0] }
    },
    {
      id: 3,
      image: "/hero-product.png",
      title: "Smart Ring X",
      price: "$199",
      delay: 0.4,
      orbit: { x: [0, -5, 15, 0], y: [0, 20, -5, 0] }
    }
  ];

  return (
    <div className="relative z-10 w-full h-[500px] hidden lg:block">
      {/* Floating Orbs for depth behind cards */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-[400px] h-[400px] rounded-full border border-border/50 border-dashed opacity-30" />
        <div className="absolute w-[300px] h-[300px] rounded-full border border-cta-secondary/20 border-dashed opacity-50" />
      </motion.div>

      {/* Hero Cards */}
      <div className="absolute inset-0 flex items-center justify-center">
        {cards.map((card, i) => {
          // Calculate positions to spread them out
          const xPos = i === 0 ? "-20%" : i === 1 ? "40%" : "10%";
          const yPos = i === 0 ? "-10%" : i === 1 ? "-20%" : "30%";
          const zIndex = i === 0 ? 10 : i === 1 ? 20 : 30;
          const scale = i === 0 ? 0.9 : i === 1 ? 1 : 1.1;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: scale,
                x: card.orbit.x,
                y: card.orbit.y
              }}
              transition={{ 
                opacity: { duration: 0.8, delay: card.delay },
                scale: { duration: 0.8, delay: card.delay },
                x: { duration: 8 + i, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 7 + i, repeat: Infinity, ease: "easeInOut" }
              }}
              style={{ left: xPos, top: yPos, zIndex }}
              className="absolute w-48 bg-surface/80 backdrop-blur-md border border-white/40 rounded-card p-4 shadow-hover flex flex-col items-center"
            >
              <div className="relative w-32 h-32 mb-4 bg-muted/5 rounded-xl flex items-center justify-center">
                 <Image src={card.image} alt={card.title} fill className="object-contain p-2 mix-blend-multiply" />
              </div>
              <h4 className="font-heading font-semibold text-foreground text-sm text-center">{card.title}</h4>
              <p className="text-cta-primary font-bold mt-1">{card.price}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
