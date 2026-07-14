export interface ReviewSummaryDTO {
  overallRating: number;
  totalReviews: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  pros: string[];
  cons: string[];
  bestFor: string[];
  notIdealFor: string[];
  recommendationPercentage: number;
  returnRate: number;
  confidenceScore: number;
  generatedAt: string;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewAuthor {
  id: string;
  name: string;
  avatar?: string;
  location: string;
  credibilityTags: string[]; // e.g. "Top Reviewer", "Expert Photographer"
}

export interface SellerResponse {
  content: string;
  repliedAt: string;
  repliedIn: string; // e.g. "3 hours"
}

export interface ProductReview {
  id: string;
  author: ReviewAuthor;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  purchasedAt: string;
  usageDuration: string;
  variantPurchased: string;
  isVerifiedPurchase: boolean;
  media: { type: "image" | "video"; url: string; thumbnail?: string }[];
  helpfulVotes: number;
  helpfulPercentage: number;
  createdAt: string;
  sellerResponse?: SellerResponse;
}
