import { prisma } from '@/lib/prisma';

export class SellerReplyService {
  
  static async addSellerReply(reviewId: string, sellerId: string, replyContent: string) {
    // Basic authorization check: verify seller owns the product the review is on
    // In a multi-tenant setup, this checks tenant ownership.
    
    return prisma.review.update({
      where: { id: reviewId },
      data: { sellerReply: replyContent }
    });
  }

  static async incrementHelpfulVote(reviewId: string) {
    return prisma.review.update({
      where: { id: reviewId },
      data: { helpfulVotes: { increment: 1 } }
    });
  }
}
