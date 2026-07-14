import { AffinityProfile, RankedProduct } from "./types";

export interface ProductRankingData {
  id: string;
  category: string;
  price: number;
  popularity: number; // 0-1
  margin: number;     // 0-1
  isNew: boolean;
}

export class RankingEngine {
  /**
   * Ranks an array of products based on affinity, popularity, and margin.
   */
  public rank(products: ProductRankingData[], affinities: AffinityProfile): RankedProduct[] {
    return products.map(product => {
      let score = 0;

      // 1. Affinity match
      const categoryAffinity = affinities[product.category] || 0.1;
      score += (categoryAffinity * 0.5); // 50% weight

      // 2. Popularity match
      score += (product.popularity * 0.3); // 30% weight

      // 3. Business logic (Margin / Freshness)
      score += (product.margin * 0.1);
      if (product.isNew) score += 0.1;

      // Price affinity logic
      const isPremiumProduct = product.price > 500;
      if (isPremiumProduct && (affinities.premium || 0) > 0.7) {
        score += 0.1;
      } else if (!isPremiumProduct && (affinities.budget || 0) > 0.7) {
        score += 0.1;
      }

      return {
        id: product.id,
        rankScore: score,
        reason: score > 0.8 ? "Highly Recommended based on your interests" : undefined
      };
    }).sort((a, b) => b.rankScore - a.rankScore);
  }
}
