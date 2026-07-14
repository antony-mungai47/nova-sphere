"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { cn } from "./Button";

export type CarouselAnimationMode = "manual" | "slide-left" | "slide-right" | "marquee" | "pause-on-hover";

export interface ProductCarouselProps {
  title?: string;
  items: React.ReactNode[];
  animationMode?: CarouselAnimationMode;
}

export function ProductCarousel({ title, items, animationMode = "manual" }: ProductCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // For marquee logic
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  
  const isInfinite = animationMode !== "manual";
  
  // Base velocity determined by mode
  const baseVelocity = animationMode === "slide-left" ? -1 : 
                       animationMode === "slide-right" ? 1 : 
                       animationMode === "marquee" ? -2 : 
                       animationMode === "pause-on-hover" ? -1 : 0;

  useAnimationFrame((t, delta) => {
    if (!isInfinite) return;
    if (animationMode === "pause-on-hover" && isHovered) return;
    
    // We want the carousel to move seamlessly
    let moveBy = baseVelocity * (delta / 16);
    
    // Simple wrap logic assuming each item + gap is ~320px
    // In a real robust implementation, we'd measure exact children widths
    const totalWidth = items.length * 320;
    
    let newX = x.get() + moveBy;
    if (baseVelocity < 0 && newX <= -totalWidth) {
      newX = 0;
    } else if (baseVelocity > 0 && newX >= 0) {
      newX = -totalWidth;
    }
    
    x.set(newX);
  });

  const checkScroll = () => {
    if (containerRef.current && animationMode === "manual") {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [items, animationMode]);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current && animationMode === "manual") {
      const scrollAmount = containerRef.current.clientWidth * 0.8;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const displayItems = isInfinite ? [...items, ...items, ...items] : items;

  return (
    <div className="relative w-full py-4 group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {title && (
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-heading font-bold text-foreground">{title}</h2>
          {animationMode === "manual" && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                className={cn("h-8 w-8 rounded-full", !canScrollLeft && "opacity-50 cursor-not-allowed")}
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={cn("h-8 w-8 rounded-full", !canScrollRight && "opacity-50 cursor-not-allowed")}
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      )}

      {isInfinite ? (
        <div className="overflow-hidden pb-8 pt-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <motion.div className="flex space-x-6 w-max" style={{ x }}>
            {displayItems.map((item, index) => (
              <div key={index} className="flex-none w-[280px] sm:w-[300px]">
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      ) : (
        <div
          ref={containerRef}
          onScroll={checkScroll}
          className="flex space-x-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 pt-4 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item, index) => (
            <motion.div
              key={index}
              className="flex-none w-[280px] sm:w-[320px] snap-start"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              {item}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
