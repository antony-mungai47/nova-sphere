"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomState, setZoomState] = useState({ isZooming: false, x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Close fullscreen on Escape
  
  const nextImage = useCallback(() => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const prevImage = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
      if (isFullscreen) {
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  

  

  // Handle Desktop Hover Pan Zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomState({ isZooming: true, x, y });
  };

  const handleMouseLeave = () => {
    setZoomState({ isZooming: false, x: 50, y: 50 });
  };

  return (
    <div className="flex flex-col md:flex-row-reverse gap-4 md:gap-6 w-full h-full">
      {/* Main Image Stage */}
      <div className="w-full flex-grow relative aspect-square md:aspect-[4/5] bg-surface border border-border rounded-2xl overflow-hidden group">
        <div 
          ref={containerRef}
          className="absolute inset-0 cursor-crosshair z-10"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => setIsFullscreen(true)}
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeIndex]}
              alt={`${productName} image ${activeIndex + 1}`}
              fill
              className="object-contain p-8 mix-blend-multiply transition-transform duration-200 ease-out"
              style={{
                transformOrigin: `${zoomState.x}% ${zoomState.y}%`,
                transform: zoomState.isZooming ? "scale(2.5)" : "scale(1)",
              }}
              priority={activeIndex === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Expand Hint */}
        <button 
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-4 right-4 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Vertical Thumbnails (Desktop) / Horizontal (Mobile) */}
      <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto scrollbar-none md:w-24 flex-shrink-0">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`relative w-20 md:w-full aspect-square rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-surface ${
              activeIndex === idx ? "border-cta-primary opacity-100 ring-2 ring-cta-primary/20" : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover mix-blend-multiply p-2" />
          </button>
        ))}
      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-xl flex items-center justify-center"
          >
            <button 
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-hover"
            >
              <X className="w-6 h-6" />
            </button>

            <button onClick={prevImage} className="absolute left-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-hover">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={nextImage} className="absolute right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-hover">
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="relative w-[90vw] h-[90vh]">
              {/* Load original HD image when in fullscreen */}
              <Image
                src={images[activeIndex]}
                alt={`${productName} HD`}
                fill
                className="object-contain cursor-zoom-out"
                onClick={() => setIsFullscreen(false)}
                quality={100}
                unoptimized // bypass optimization to allow highest quality on zoom if available
              />
            </div>
            
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
               {images.map((img, idx) => (
                 <button
                   key={idx}
                   onClick={() => setActiveIndex(idx)}
                   className={`w-2.5 h-2.5 rounded-full transition-all ${
                     activeIndex === idx ? "bg-cta-primary w-8" : "bg-muted"
                   }`}
                 />
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
