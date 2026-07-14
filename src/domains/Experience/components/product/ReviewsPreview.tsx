"use client";

import React from "react";
import { Star, StarHalf, ThumbsUp, MessageSquare } from "lucide-react";

export function ReviewsPreview({ rating, count }: { rating: number; count: number }) {
  if (count === 0) return null;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-warning text-warning" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} className="w-4 h-4 fill-warning text-warning" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-muted/50" />);
      }
    }
    return stars;
  };

  return (
    <div className="flex flex-col gap-4 py-6 border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">{rating.toFixed(1)}</span>
          <div className="flex flex-col">
             <div className="flex gap-0.5">{renderStars(rating)}</div>
             <span className="text-xs text-muted-foreground">{count.toLocaleString()} Reviews</span>
          </div>
        </div>
        <button className="text-sm font-medium text-cta-primary hover:underline">See all →</button>
      </div>

      {/* Mini top reviews snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        <div className="bg-muted/10 rounded-xl p-4 border border-border">
           <div className="flex items-center justify-between mb-2">
              <div className="flex gap-0.5">{renderStars(5)}</div>
              <span className="text-xs text-muted-foreground">2 days ago</span>
           </div>
           <p className="text-sm text-foreground font-medium mb-1">Exceeded all expectations</p>
           <p className="text-xs text-muted-foreground line-clamp-2">This product completely transformed my setup. The build quality is phenomenal and it works flawlessly.</p>
           <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> 24</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 2</span>
           </div>
        </div>
        <div className="bg-muted/10 rounded-xl p-4 border border-border hidden sm:block">
           <div className="flex items-center justify-between mb-2">
              <div className="flex gap-0.5">{renderStars(4.5)}</div>
              <span className="text-xs text-muted-foreground">1 week ago</span>
           </div>
           <p className="text-sm text-foreground font-medium mb-1">Great value for money</p>
           <p className="text-xs text-muted-foreground line-clamp-2">Arrived quickly and exactly as described. The features are top-notch for the price point.</p>
           <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> 12</span>
           </div>
        </div>
      </div>
    </div>
  );
}
