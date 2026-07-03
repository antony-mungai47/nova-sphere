import { prisma } from '@/lib/prisma';

export class AuctionAnalytics {
  
  static async getAuctionIntelligence(auctionId: string) {
    const bids = await prisma.bid.findMany({
      where: { auctionId },
      orderBy: { createdAt: 'asc' }
    });

    const totalBids = bids.length;
    const uniqueBidders = new Set(bids.map(b => b.userId)).size;
    
    // Bid velocity: Bids per hour (based on first and last bid time)
    let bidVelocityPerHour = 0;
    if (totalBids > 1) {
      const firstBidTime = bids[0].createdAt.getTime();
      const lastBidTime = bids[totalBids - 1].createdAt.getTime();
      const hoursDiff = (lastBidTime - firstBidTime) / (1000 * 60 * 60);
      if (hoursDiff > 0) {
        bidVelocityPerHour = totalBids / hoursDiff;
      }
    }

    return {
      totalBids,
      uniqueBidders,
      bidVelocityPerHour: Math.round(bidVelocityPerHour * 10) / 10
    };
  }
}
