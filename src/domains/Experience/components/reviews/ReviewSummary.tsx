"use client";

import React from "react";
import { ReviewSummaryDTO } from "./types";
import { Star, StarHalf, ThumbsUp, ThumbsDown, Package, Activity, Info } from "lucide-react";
import { motion } from "framer-motion";

interface ReviewSummaryProps {
  summary: ReviewSummaryDTO;
  onFilterRating?: (rating: number) => void;
}

export function ReviewSummary({ summary, onFilterRating }: ReviewSummaryProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-5 h-5 fill-warning text-warning" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} className="w-5 h-5 fill-warning text-warning" />);
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-muted/30" />);
      }
    }
    return stars;
  };

  const maxDistribution = Math.max(...Object.values(summary.ratingDistribution));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
      
      {/* LEFT: Overall Rating & Distribution */}
      <div className="flex flex-col">
        <h3 className="text-xl font-bold text-foreground mb-6">Customer Reviews</h3>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-6xl font-bold text-foreground">{summary.overallRating.toFixed(1)}</span>
          <div className="flex flex-col">
            <div className="flex gap-1 mb-1">{renderStars(summary.overallRating)}</div>
            <p className="text-sm text-muted-foreground">{summary.totalReviews.toLocaleString()} Global Ratings</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = summary.ratingDistribution[rating as keyof typeof summary.ratingDistribution];
            const percentage = (count / summary.totalReviews) * 100;
            return (
              <button 
                key={rating}
                onClick={() => onFilterRating?.(rating)}
                className="flex items-center gap-3 group text-sm hover:opacity-80 transition-opacity"
              >
                <span className="w-12 text-muted-foreground group-hover:text-cta-primary font-medium">{rating} Stars</span>
                <div className="flex-1 h-3 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-warning rounded-full" 
                  />
                </div>
                <span className="w-10 text-right text-muted-foreground">{Math.round(percentage)}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CENTER: AI Review Summary */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
           <div className="flex items-center gap-1.5 bg-cta-primary/10 text-cta-primary px-2.5 py-1 rounded-full text-xs font-bold">
             <Activity className="w-3.5 h-3.5" /> AI Summary
           </div>
        </div>
        
        <h4 className="font-bold text-foreground mb-4">What buyers are saying</h4>
        
        {/* Sentiment Meter */}
        <div className="mb-6">
          <div className="flex h-2.5 rounded-full overflow-hidden mb-2">
            <div style={{ width: `${summary.sentiment.positive}%` }} className="bg-emerald-500" />
            <div style={{ width: `${summary.sentiment.neutral}%` }} className="bg-warning" />
            <div style={{ width: `${summary.sentiment.negative}%` }} className="bg-danger" />
          </div>
          <div className="flex justify-between text-xs font-medium">
            <span className="text-emerald-500">😊 {summary.sentiment.positive}% Positive</span>
            <span className="text-warning">😐 {summary.sentiment.neutral}%</span>
            <span className="text-danger">☹ {summary.sentiment.negative}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-emerald-500 font-bold flex items-center gap-1.5 mb-2"><ThumbsUp className="w-4 h-4" /> Top Pros</span>
            <ul className="text-muted-foreground space-y-1 list-disc pl-4">
              {summary.pros.slice(0, 3).map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
          <div>
            <span className="text-danger font-bold flex items-center gap-1.5 mb-2"><ThumbsDown className="w-4 h-4" /> Top Cons</span>
            <ul className="text-muted-foreground space-y-1 list-disc pl-4">
              {summary.cons.slice(0, 3).map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" /> 
          Generated from {summary.totalReviews} reviews. Confidence Score: {summary.confidenceScore}/100.
        </div>
      </div>

      {/* RIGHT: Trust Metrics */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-foreground mb-2">Trust Metrics</h3>
        
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
             <ThumbsUp className="w-6 h-6" />
           </div>
           <div>
             <p className="text-2xl font-bold text-foreground">{summary.recommendationPercentage}%</p>
             <p className="text-sm text-muted-foreground">Recommend this item</p>
           </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-cta-primary/10 flex items-center justify-center text-cta-primary">
             <Package className="w-6 h-6" />
           </div>
           <div>
             <p className="text-2xl font-bold text-foreground">{summary.returnRate}%</p>
             <p className="text-sm text-muted-foreground">Return rate (Lower is better)</p>
           </div>
        </div>
        
        {summary.bestFor.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-bold text-foreground mb-2">Best For</p>
            <div className="flex flex-wrap gap-2">
              {summary.bestFor.map((item, i) => (
                <span key={i} className="bg-muted/20 text-muted-foreground px-2.5 py-1 rounded-md text-xs font-medium border border-border">{item}</span>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
