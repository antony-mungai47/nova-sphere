import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class AuctionFraudEngine {

  /**
   * Evaluates if a bid is potentially fraudulent (e.g., self-bidding, bid pumping).
   */
  static async validateBidRisk(auctionId: string, userId: string, amount: Prisma.Decimal) {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        product: true
      }
    });

    if (!auction) throw new Error('Auction not found');

    // 1. Self-bidding detection
    // Assuming products might have an owner/tenant associated
    // (If the user who owns the product tries to bid on it)
    // NOTE: This depends on how sellers are modeled. For now we use createdBy or ownerTenantId.
    if (auction.product.createdBy === userId) {
      throw new Error('Fraud Flag: Sellers cannot bid on their own auctions.');
    }

    // 2. Bid pumping detection
    // Example: User bids repeatedly against themselves when they are already the highest bidder
    if (auction.highestBidderId === userId) {
      throw new Error('Fraud Flag: You are already the highest bidder.');
    }

    // 3. Rapid bot bidding
    // Check if user placed > 5 bids in the last 10 seconds globally
    const tenSecondsAgo = new Date(Date.now() - 10000);
    const recentBids = await prisma.bid.count({
      where: {
        userId,
        createdAt: { gte: tenSecondsAgo }
      }
    });

    if (recentBids > 5) {
      throw new Error('Fraud Flag: Rate limit exceeded. Bot behavior detected.');
    }

    return true; // Safe to proceed
  }
}
