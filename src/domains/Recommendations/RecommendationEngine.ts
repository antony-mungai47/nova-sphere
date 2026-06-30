import { prisma } from '@/lib/prisma';
import { RecommendationScoreService } from './RecommendationScoreService';
import { SearchDocument } from '@/domains/Search/providers';

export class RecommendationEngine {
  /**
   * Retrieves products that have the highest velocity of 'VIEW_PRODUCT' and 'PURCHASE' events.
   */
  static async getTrending(limit = 10): Promise<SearchDocument[]> {
    // In a real implementation, we would query the DailyAnalyticsSnapshot or a materialized view.
    // For now, we simulate fetching highly rated/trending products from Prisma.
    const products = await prisma.product.findMany({
      where: { isTrending: true },
      take: limit,
      orderBy: { healthScore: 'desc' },
      include: { images: true }
    });

    return products.map(RecommendationScoreService.mapToSearchDocument);
  }

  /**
   * Retrieves products based on IP geolocation context (Country, Season, Weather)
   */
  static async getRegionalPicks(countryCode: string, season: string, limit = 10): Promise<SearchDocument[]> {
    // Placeholder for regional personalization logic
    const products = await prisma.product.findMany({
      take: limit,
      orderBy: { rating: 'desc' },
      include: { images: true }
    });
    
    return products.map(RecommendationScoreService.mapToSearchDocument);
  }

  static async getRecentlyViewed(userId: string, limit = 10): Promise<SearchDocument[]> {
    const recentActivity = await prisma.userActivity.findMany({
      where: { userId, activityType: 'VIEW_PRODUCT' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      distinct: ['resourceId'],
    });

    const productIds = recentActivity.map(a => a.resourceId).filter(Boolean) as string[];
    
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { images: true }
    });

    return products.map(RecommendationScoreService.mapToSearchDocument);
  }

  static async getLuxuryPicks(limit = 10): Promise<SearchDocument[]> {
    const products = await prisma.product.findMany({
      where: { price: { gt: 500 } },
      take: limit,
      orderBy: { healthScore: 'desc' },
      include: { images: true }
    });
    return products.map(RecommendationScoreService.mapToSearchDocument);
  }

  static async getFrequentlyBoughtTogether(productId: string, limit = 4): Promise<SearchDocument[]> {
    // Advanced graph querying would go here.
    const products = await prisma.product.findMany({
      where: { id: { not: productId } },
      take: limit,
      orderBy: { rating: 'desc' },
      include: { images: true }
    });
    return products.map(RecommendationScoreService.mapToSearchDocument);
  }
}
