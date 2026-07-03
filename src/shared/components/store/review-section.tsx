"use client";

import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { Review } from '@prisma/client';

type ReviewWithUser = Review & {
  user: { name: string | null };
};

interface ReviewSectionProps {
  productId: string;
  averageRating: number;
  reviewCount: number;
  ratingDistribution: any;
  reviews: ReviewWithUser[];
  canReview: boolean;
}

export function ReviewSection({ productId, averageRating, reviewCount, ratingDistribution, reviews, canReview }: ReviewSectionProps) {
  const [isWriting, setIsWriting] = useState(false);

  return (
    <div className="py-12 border-t border-white/10">
      <div className="flex flex-col md:flex-row gap-12">
        
        {/* Rating Summary */}
        <div className="w-full md:w-1/3 space-y-6">
          <h3 className="text-2xl font-bold text-white">Customer Reviews</h3>
          <div className="flex items-center gap-4">
            <div className="flex gap-1 text-nova-accent">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-6 h-6 ${averageRating >= star ? 'fill-current' : 'text-white/20'}`} />
              ))}
            </div>
            <span className="text-2xl font-bold text-white">{averageRating.toFixed(1)} out of 5</span>
          </div>
          <p className="text-nova-silver">{reviewCount} global ratings</p>
          
          {/* Distribution Bars */}
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution?.[star] || 0;
              const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-4 text-sm">
                  <span className="w-12 text-nova-silver hover:text-nova-blue cursor-pointer">{star} star</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-nova-accent rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="w-12 text-right text-nova-silver">{Math.round(percentage)}%</span>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-white/10">
            <h4 className="font-bold text-white mb-2">Review this product</h4>
            <p className="text-sm text-nova-silver mb-4">Share your thoughts with other customers</p>
            {canReview ? (
              <button 
                onClick={() => setIsWriting(true)}
                className="w-full py-2 bg-white/5 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                Write a customer review
              </button>
            ) : (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                You must have a delivered purchase to write a review.
              </div>
            )}
          </div>
        </div>

        {/* Review List */}
        <div className="w-full md:w-2/3 space-y-8">
          {reviews.map((review) => (
            <div key={review.id} className="pb-8 border-b border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-nova-blue/20 flex items-center justify-center text-nova-blue font-bold">
                  {review.user.name?.[0] || 'A'}
                </div>
                <span className="font-bold text-white">{review.user.name || 'Anonymous User'}</span>
              </div>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="flex text-nova-accent">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-4 h-4 ${review.rating >= star ? 'fill-current' : 'text-white/20'}`} />
                  ))}
                </div>
                <span className="font-bold text-white text-sm">{review.title}</span>
              </div>
              
              <span className="text-xs font-semibold text-emerald-400 mb-4 block">Verified Purchase</span>
              <p className="text-nova-silver text-sm leading-relaxed mb-4">{review.content}</p>
              
              <div className="flex items-center gap-6 text-sm text-nova-silver/70">
                <button className="flex items-center gap-2 hover:text-nova-blue transition-colors">
                  <ThumbsUp className="w-4 h-4" /> {review.helpfulVotes || 'Helpful'}
                </button>
                <button className="flex items-center gap-2 hover:text-white transition-colors">
                  Report abuse
                </button>
              </div>

              {review.sellerReply && (
                <div className="mt-4 p-4 bg-nova-blue/5 border-l-2 border-nova-blue rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-nova-blue" />
                    <span className="font-bold text-white text-sm">Response from Nova Sphere</span>
                  </div>
                  <p className="text-sm text-nova-silver">{review.sellerReply}</p>
                </div>
              )}
            </div>
          ))}
          
          {reviews.length === 0 && (
            <div className="text-center py-12 text-nova-silver">
              No reviews yet. Be the first to share your experience!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
