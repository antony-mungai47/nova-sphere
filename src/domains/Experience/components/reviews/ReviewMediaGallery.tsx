"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";

interface ReviewMedia {
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  reviewId: string;
}

interface ReviewMediaGalleryProps {
  media: ReviewMedia[];
}

export function ReviewMediaGallery({ media }: ReviewMediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<ReviewMedia | null>(null);

  if (!media || media.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">Customer Photos & Videos</h3>
        <button className="text-sm font-medium text-cta-primary hover:underline">View All →</button>
      </div>

      {/* Masonry Grid via CSS columns */}
      <div className="columns-2 sm:columns-3 lg:columns-5 gap-4 space-y-4">
        {media.slice(0, 10).map((item, idx) => (
          <div 
            key={`${item.reviewId}-${idx}`}
            onClick={() => setSelectedMedia(item)}
            className="relative break-inside-avoid rounded-xl overflow-hidden cursor-pointer group bg-muted/20 border border-border"
          >
            {item.type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 ml-1" />
                </div>
              </div>
            )}
            
            <Image
              src={item.thumbnail || item.url}
              alt="Customer Review Media"
              width={300}
              height={300}
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-xl flex items-center justify-center"
          >
            <button 
              onClick={() => setSelectedMedia(null)}
              className="absolute top-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-hover"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-[90vw] h-[90vh] max-w-5xl flex items-center justify-center">
              {selectedMedia.type === "image" ? (
                <Image
                  src={selectedMedia.url}
                  alt="Review Media Full"
                  fill
                  className="object-contain"
                />
              ) : (
                <video 
                  src={selectedMedia.url} 
                  controls 
                  autoPlay 
                  className="max-w-full max-h-full rounded-xl"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
