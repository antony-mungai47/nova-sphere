"use client";

import React from "react";
import { ProductReview } from "./types";
import { Star, StarHalf, ThumbsUp, CheckCircle, ShieldCheck, MessageSquareReply } from "lucide-react";
import Image from "next/image";

export function ReviewCard({ review }: { review: ProductReview }) {
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
        stars.push(<Star key={i} className="w-4 h-4 text-muted/30" />);
      }
    }
    return stars;
  };

  return (
    <div className="py-8 border-b border-border/50">
      
      {/* Reviewer Meta & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cta-primary/10 flex items-center justify-center text-cta-primary font-bold text-lg flex-shrink-0">
             {review.author.avatar ? (
                <img src={review.author.avatar} alt={review.author.name} className="w-full h-full rounded-full object-cover" />
             ) : (
                review.author.name.charAt(0).toUpperCase()
             )}
          </div>
          <div className="flex flex-col">
             <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{review.author.name}</span>
                {review.isVerifiedPurchase && (
                   <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                     <CheckCircle className="w-3 h-3" /> Verified Purchase
                   </span>
                )}
             </div>
             <div className="text-xs text-muted-foreground mt-0.5 flex items-center flex-wrap gap-x-3 gap-y-1">
                <span>{review.author.location}</span>
                <span>•</span>
                <span>Used for {review.usageDuration}</span>
                <span>•</span>
                <span>Purchased {review.purchasedAt}</span>
             </div>
          </div>
        </div>

        {/* Credibility Tags */}
        {review.author.credibilityTags && review.author.credibilityTags.length > 0 && (
          <div className="flex gap-2">
             {review.author.credibilityTags.map((tag, i) => (
                <span key={i} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 px-2 py-1 rounded">
                   <ShieldCheck className="w-3 h-3" /> {tag}
                </span>
             ))}
          </div>
        )}
      </div>

      {/* Rating & Title */}
      <div className="flex items-center gap-3 mb-3">
         <div className="flex gap-0.5">{renderStars(review.rating)}</div>
         <h4 className="font-bold text-foreground text-lg">{review.title}</h4>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Variant: {review.variantPurchased}</p>

      {/* Pros & Cons (Structured Data) */}
      {(review.pros.length > 0 || review.cons.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 bg-surface p-4 rounded-xl border border-border">
          {review.pros.length > 0 && (
             <div>
               <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider mb-2 block">Pros</span>
               <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                 {review.pros.map((p, i) => <li key={i}>{p}</li>)}
               </ul>
             </div>
          )}
          {review.cons.length > 0 && (
             <div>
               <span className="text-danger text-xs font-bold uppercase tracking-wider mb-2 block">Cons</span>
               <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                 {review.cons.map((c, i) => <li key={i}>{c}</li>)}
               </ul>
             </div>
          )}
        </div>
      )}

      {/* Review Body */}
      <p className="text-muted-foreground text-sm leading-relaxed mb-6 whitespace-pre-wrap">
        {review.content}
      </p>

      {/* Media Thumbnails */}
      {review.media && review.media.length > 0 && (
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {review.media.map((m, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
              <Image src={m.thumbnail || m.url} alt="Review Media" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Actions & Helpfulness */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3 text-sm">
           <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors">
              <ThumbsUp className="w-4 h-4" /> 
              <span>Helpful</span>
           </button>
           <span className="text-muted-foreground">
             <strong className="text-foreground">{review.helpfulVotes}</strong> people found this helpful ({review.helpfulPercentage}%)
           </span>
        </div>
        <span className="text-xs text-muted-foreground">{review.createdAt}</span>
      </div>

      {/* Seller Response */}
      {review.sellerResponse && (
        <div className="mt-6 ml-4 sm:ml-8 pl-4 border-l-2 border-cta-primary/30">
           <div className="flex items-center gap-2 mb-2">
              <div className="bg-cta-primary text-cta-primary-foreground p-1 rounded-full">
                 <MessageSquareReply className="w-3 h-3" />
              </div>
              <span className="font-bold text-foreground text-sm">Seller Response</span>
              <span className="text-xs text-muted-foreground ml-2">• Replied in {review.sellerResponse.repliedIn}</span>
           </div>
           <p className="text-sm text-muted-foreground">
              {review.sellerResponse.content}
           </p>
        </div>
      )}

    </div>
  );
}
