export interface AffinityProfile {
  [categoryOrTrait: string]: number; // e.g. { "photography": 0.91, "gaming": 0.73, "budget": 0.8 }
}

export interface ContextualOffer {
  id: string;
  type: "free_shipping" | "reward_points" | "bundle_offer" | "price_drop" | "limited_stock" | "vip_discount" | "recently_viewed" | "welcome_back";
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  expiresAt?: string;
}

export interface HeroVariant {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  theme: "dark" | "light";
}

export interface PersonalizationContext {
  affinities: AffinityProfile;
  campaign?: string;
  experimentGroup?: string; // e.g. "A", "B", "Control"
  offers: ContextualOffer[];
  recommendedCategories: string[];
  heroVariant: HeroVariant;
  recommendationModel: string;
}

export interface RankedProduct {
  id: string;
  rankScore: number;
  reason?: string;
  // Product data will be merged here by the UI/BFF
}
