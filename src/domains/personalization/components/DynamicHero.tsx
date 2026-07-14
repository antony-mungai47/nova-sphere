"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useExperience } from "../sdk/hooks";

export function DynamicHero() {
  const { context, trackExperienceEvent } = useExperience();

  useEffect(() => {
    if (context?.heroVariant) {
      trackExperienceEvent("hero.changed", { variantId: context.heroVariant.id });
    }
  }, [context?.heroVariant, trackExperienceEvent]);

  if (!context) {
    // Skeleton or default while resolving
    return (
      <div className="w-full h-[600px] bg-muted/20 animate-pulse relative" />
    );
  }

  const { heroVariant } = context;

  return (
    <div className="relative w-full h-[600px] overflow-hidden bg-background group">
      <Image 
        src={heroVariant.imageUrl} 
        alt={heroVariant.title} 
        fill 
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        priority
      />
      <div className={`absolute inset-0 ${heroVariant.theme === 'dark' ? 'bg-black/50' : 'bg-white/30'} backdrop-blur-[2px]`} />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
        <h1 className={`text-4xl md:text-6xl font-black mb-4 tracking-tighter ${heroVariant.theme === 'dark' ? 'text-white' : 'text-black'}`}>
          {heroVariant.title}
        </h1>
        <p className={`text-lg md:text-xl font-medium mb-8 max-w-2xl ${heroVariant.theme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>
          {heroVariant.subtitle}
        </p>
        <Link 
          href={heroVariant.ctaLink}
          className={`px-8 py-4 rounded-full font-bold transition-all shadow-hover ${
            heroVariant.theme === 'dark' 
              ? 'bg-white text-black hover:bg-gray-100' 
              : 'bg-black text-white hover:bg-gray-900'
          }`}
        >
          {heroVariant.ctaText}
        </Link>
      </div>
    </div>
  );
}
