"use client";

import React, { useState, useMemo } from "react";
import { ReviewSummaryDTO, ProductReview } from "./types";
import { ReviewSummary } from "./ReviewSummary";
import { TopicChips } from "./TopicChips";
import { ReviewSearch } from "./ReviewSearch";
import { ReviewMediaGallery } from "./ReviewMediaGallery";
import { ReviewCard } from "./ReviewCard";

const MOCK_SUMMARY: ReviewSummaryDTO = {
  overallRating: 4.8,
  totalReviews: 2431,
  sentiment: { positive: 92, neutral: 6, negative: 2 },
  pros: ["Battery lasts two full days", "Packaging was excellent", "Seller shipped within 24 hours"],
  cons: ["Charger cable is a bit short", "Fingerprint magnet"],
  bestFor: ["Power Users", "Frequent Travelers", "Content Creators"],
  notIdealFor: ["Casual Users on a budget"],
  recommendationPercentage: 94,
  returnRate: 2.1,
  confidenceScore: 98,
  generatedAt: new Date().toISOString(),
  ratingDistribution: { 5: 1980, 4: 310, 3: 100, 2: 30, 1: 11 },
};

const MOCK_TOPICS = [
  { name: "Battery", count: 231 },
  { name: "Delivery", count: 187 },
  { name: "Camera", count: 94 },
  { name: "Packaging", count: 62 },
  { name: "Customer Service", count: 48 },
];

const MOCK_REVIEWS: ProductReview[] = [
  {
    id: "r1",
    author: {
      id: "a1",
      name: "John D.",
      location: "🇺🇸 United States",
      credibilityTags: ["Top Reviewer", "Expert Photographer"],
    },
    rating: 5,
    title: "Exceeded all expectations",
    content: "This product completely transformed my setup. The build quality is phenomenal and it works flawlessly with the rest of my ecosystem. Highly recommended for anyone looking to upgrade!\n\nThe battery easily lasts me two full days of heavy use.",
    pros: ["Incredible battery life", "Premium build quality", "Fast delivery"],
    cons: ["Slightly heavier than previous generation"],
    purchasedAt: "March 2026",
    usageDuration: "4 months",
    variantPurchased: "256GB Midnight Black",
    isVerifiedPurchase: true,
    media: [
      { type: "image", url: "/hero-product.png" },
      { type: "image", url: "/hero-product.png" }
    ],
    helpfulVotes: 124,
    helpfulPercentage: 92,
    createdAt: "2 weeks ago",
    sellerResponse: {
      content: "Thank you for the fantastic review, John! We're thrilled to hear the battery life is holding up well for your photography workflow.",
      repliedAt: "2 weeks ago",
      repliedIn: "3 hours"
    }
  },
  {
    id: "r2",
    author: {
      id: "a2",
      name: "Sarah K.",
      location: "🇬🇧 United Kingdom",
      credibilityTags: ["Verified Buyer", "Repeat Buyer"],
    },
    rating: 4,
    title: "Great product, okay cable",
    content: "I absolutely love the device itself. The screen is crisp and the camera is unmatched. My only gripe is that the included charging cable is barely 3 feet long. If they included a longer braided cable, it would be a perfect 5 stars.",
    pros: ["Amazing screen", "Camera quality"],
    cons: ["Included cable is too short"],
    purchasedAt: "May 2026",
    usageDuration: "1 month",
    variantPurchased: "512GB Titanium",
    isVerifiedPurchase: true,
    media: [
      { type: "image", url: "/hero-product.png" }
    ],
    helpfulVotes: 45,
    helpfulPercentage: 85,
    createdAt: "1 week ago"
  }
];

export function ProductReviews() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState<string | undefined>();
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  // Extract all media for the gallery
  const allMedia = useMemo(() => {
    return MOCK_REVIEWS.flatMap(r => r.media || []);
  }, []);

  const filteredReviews = useMemo(() => {
    return MOCK_REVIEWS.filter(r => {
      // Basic text search filter
      if (searchQuery && !r.content.toLowerCase().includes(searchQuery.toLowerCase()) && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Topic filter mock (in reality this checks tags or NLP analysis)
      if (activeTopic && !r.content.toLowerCase().includes(activeTopic.toLowerCase())) {
        return false;
      }
      // Rating filter
      if (ratingFilter && Math.floor(r.rating) !== ratingFilter) {
        return false;
      }
      return true;
    });
  }, [searchQuery, activeTopic, ratingFilter]);

  return (
    <section className="w-full mt-24 pt-16 border-t border-border">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        
        {/* Top Summary & Trust Metrics */}
        <ReviewSummary 
          summary={MOCK_SUMMARY} 
          onFilterRating={(rating) => setRatingFilter(rating === ratingFilter ? null : rating)} 
        />

        {/* Global Media Gallery */}
        <ReviewMediaGallery media={allMedia as any} />

        {/* Controls: Search, Chips, Filters */}
        <div className="bg-surface/50 border border-border rounded-2xl p-6 mb-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 border-b border-border/50 pb-6">
              <ReviewSearch 
                onSearch={setSearchQuery} 
                onOpenFilters={() => {}} 
              />
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                 <span>Sort by: <strong className="text-foreground cursor-pointer">Top Reviews</strong></span>
              </div>
           </div>
           
           <TopicChips 
              topics={MOCK_TOPICS} 
              activeTopic={activeTopic} 
              onSelectTopic={setActiveTopic} 
           />
           
           {/* Active Filters Display */}
           {(searchQuery || activeTopic || ratingFilter) && (
              <div className="flex items-center gap-2 mt-4 text-sm">
                <span className="text-muted-foreground mr-2">Filtering by:</span>
                {searchQuery && <span className="bg-muted text-foreground px-2 py-1 rounded-md">"{searchQuery}"</span>}
                {activeTopic && <span className="bg-muted text-foreground px-2 py-1 rounded-md">Topic: {activeTopic}</span>}
                {ratingFilter && <span className="bg-muted text-foreground px-2 py-1 rounded-md">{ratingFilter} Stars</span>}
                <button 
                  onClick={() => { setSearchQuery(""); setActiveTopic(undefined); setRatingFilter(null); }}
                  className="text-cta-primary hover:underline ml-2"
                >
                  Clear All
                </button>
              </div>
           )}
        </div>

        {/* Review List */}
        <div className="max-w-4xl">
          <h3 className="text-xl font-bold text-foreground mb-6">
             {filteredReviews.length} {filteredReviews.length === 1 ? "Review" : "Reviews"}
          </h3>
          
          {filteredReviews.length > 0 ? (
            <div className="flex flex-col">
              {filteredReviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground bg-surface rounded-2xl border border-border">
               No reviews match your filters. Try adjusting your search or topics.
            </div>
          )}
          
          {filteredReviews.length > 0 && (
             <div className="mt-8 flex justify-center">
                <button className="px-6 py-3 rounded-xl border border-border bg-surface font-bold text-foreground hover:bg-surface-hover transition-colors">
                  Load More Reviews
                </button>
             </div>
          )}
        </div>

      </div>
    </section>
  );
}
