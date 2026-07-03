import { AIContext } from '../ContextEngine/ContextEngine';
import { prisma } from '@/lib/prisma';

export interface RecommendationStrategy {
  name: string;
  weight: number;
  getRecommendations(context: AIContext): Promise<{ productId: string; score: number; reason: string }[]>;
}

export class RecentlyViewedStrategy implements RecommendationStrategy {
  name = 'RecentlyViewed';
  weight = 1.0;

  async getRecommendations(context: AIContext) {
    if (!context.userId) return [];
    
    const views = await prisma.recentlyViewed.findMany({
      where: { userId: context.userId },
      orderBy: { viewedAt: 'desc' },
      take: 5
    });

    return views.map((v, i) => ({
      productId: v.productId,
      score: this.weight * (1 - i * 0.1), // Diminishing returns for older views
      reason: 'Because you recently viewed this item'
    }));
  }
}

export class TrendingStrategy implements RecommendationStrategy {
  name = 'Trending';
  weight = 0.8;

  async getRecommendations(context: AIContext) {
    // Mocked for now: In reality, query orders in the last 24h grouped by productId
    const products = await prisma.product.findMany({ take: 5 });
    
    return products.map(p => ({
      productId: p.id,
      score: this.weight,
      reason: 'Trending in your region right now'
    }));
  }
}
