import { prisma } from '@/lib/prisma';

export type ReviewEligibilityStatus = 
  | 'ELIGIBLE' 
  | 'ALREADY_REVIEWED' 
  | 'NOT_DELIVERED' 
  | 'REFUNDED' 
  | 'CANCELLED' 
  | 'SELLER_RESTRICTED' 
  | 'EXPIRED';

export class ReviewEligibilityEngine {
  /**
   * Determines if a user can review a product based on their order history.
   */
  static async canReview(userId: string, productId: string): Promise<{ status: ReviewEligibilityStatus; canReview: boolean }> {
    // 1. Check if already reviewed
    const existingReview = await prisma.review.findFirst({
      where: { userId, productId }
    });
    if (existingReview) return { status: 'ALREADY_REVIEWED', canReview: false };

    // 2. Check for delivered order containing the product
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
        }
      },
      include: { order: true },
      orderBy: { order: { createdAt: 'desc' } }
    });

    if (!orderItem) return { status: 'NOT_DELIVERED', canReview: false };

    if (orderItem.order.status === 'REFUNDED') return { status: 'REFUNDED', canReview: false };
    if (orderItem.order.status === 'CANCELLED') return { status: 'CANCELLED', canReview: false };
    if (orderItem.order.status !== 'DELIVERED') return { status: 'NOT_DELIVERED', canReview: false };

    return { status: 'ELIGIBLE', canReview: true };
  }
}
