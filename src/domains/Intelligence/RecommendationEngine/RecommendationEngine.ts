import { AIContext } from '../ContextEngine/ContextEngine';
import { RecommendationStrategy, RecentlyViewedStrategy, TrendingStrategy } from './Strategies';
import { prisma } from '@/lib/prisma';

export class RecommendationEngine {
  private strategies: RecommendationStrategy[] = [
    new RecentlyViewedStrategy(),
    new TrendingStrategy()
  ];

  async getCuratedFeed(context: AIContext) {
    const rawScores = await Promise.all(
      this.strategies.map(s => s.getRecommendations(context))
    );
    
    // Combine and rank logic
    const scoreMap = new Map<string, { score: number, reason: string }>();

    for (const strategyResults of rawScores) {
      for (const res of strategyResults) {
        if (scoreMap.has(res.productId)) {
          const current = scoreMap.get(res.productId)!;
          scoreMap.set(res.productId, {
            score: current.score + res.score,
            reason: current.reason // Keep primary reason
          });
        } else {
          scoreMap.set(res.productId, { score: res.score, reason: res.reason });
        }
      }
    }

    // Sort by final score
    const rankedIds = Array.from(scoreMap.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 10);

    if (rankedIds.length === 0) return [];

    const products = await prisma.product.findMany({
      where: { id: { in: rankedIds.map(r => r[0]) } }
    });

    return rankedIds.map(([id, meta]) => ({
      product: products.find(p => p.id === id)!,
      confidence: meta.score,
      reason: meta.reason // Explainability string
    }));
  }
}
