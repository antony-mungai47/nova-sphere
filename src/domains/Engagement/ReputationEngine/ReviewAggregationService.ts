import { prisma } from '@/lib/prisma';

export class ReviewAggregationService {
  /**
   * Recalculates and caches the average rating on the Product model.
   * This should be called asynchronously after a review is APPROVED or deleted.
   */
  static async recalculateProductRating(productId: string) {
    const aggregations = await prisma.review.aggregate({
      where: { productId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: { rating: true }
    });

    const reviews = await prisma.review.findMany({
      where: { productId, status: 'APPROVED' },
      select: { rating: true }
    });

    // Calculate distribution (1-5 stars)
    const distribution = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    for (const r of reviews) {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating as keyof typeof distribution]++;
      }
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: aggregations._avg.rating || 0,
        reviewCount: aggregations._count.rating || 0,
        ratingDistribution: distribution
      }
    });
  }
}
