import { SearchDocument } from '@/domains/Search/providers';

export class RecommendationScoreService {
  /**
   * Dynamically calculates a recommendation score for a given context.
   * Recommendation Score = Popularity + Season + Location + Rating + Inventory + Freshness + Personal Interest
   */
  static calculateScore(product: any, userContext?: any): number {
    let score = product.healthScore || 50;
    
    // Add points for rating
    score += (product.rating * 5);
    
    // Add points for trending status
    if (product.isTrending) score += 20;

    // Deduct points for low inventory
    if (product.stock < 5) score -= 15;

    // TODO: Add complex personalization scoring based on userContext (location, season, previous history)
    
    return score;
  }

  /**
   * Helper to map Prisma Product to SearchDocument interface
   */
  static mapToSearchDocument(product: any): SearchDocument {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand,
      imageUrl: product.images?.[0]?.url || '',
      healthScore: product.healthScore,
      isTrending: product.isTrending,
    };
  }
}
