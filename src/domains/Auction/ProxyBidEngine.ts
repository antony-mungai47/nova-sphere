import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { BidEngine } from './BidEngine';

export class ProxyBidEngine {
  /**
   * Processes proxy bids for an auction after a new bid is placed.
   * If there's an existing proxy bid that can outbid the new bid, it automatically places it.
   */
  static async evaluateProxyBids(auctionId: string) {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        bids: {
          where: { isProxyBid: true, status: 'OUTBID' }, // We look for outbid proxies that can go higher
          orderBy: { maximumBid: 'desc' }
        }
      }
    });

    if (!auction || auction.bids.length === 0) return;

    // The highest available proxy that isn't the current highest bidder
    const bestProxy = auction.bids.find(b => b.userId !== auction.highestBidderId);

    if (bestProxy && bestProxy.maximumBid && bestProxy.maximumBid.gt(auction.currentBid)) {
      // Calculate next increment. For now, we just add $10 or go to their max if it's less.
      // In a real system, there are increment tiers.
      const increment = new Prisma.Decimal(10);
      let nextBidAmount = auction.currentBid.add(increment);
      
      if (nextBidAmount.gt(bestProxy.maximumBid)) {
        nextBidAmount = bestProxy.maximumBid;
      }

      await BidEngine.placeBid({
        auctionId,
        userId: bestProxy.userId,
        amount: nextBidAmount,
        currency: bestProxy.currency,
        isProxyBid: true,
        maximumBid: bestProxy.maximumBid
      });

      // After placing, we must evaluate proxy bids again because someone ELSE might have a higher proxy.
      // The recursive call will eventually stop when the highest proxy wins.
      await ProxyBidEngine.evaluateProxyBids(auctionId);
    }
  }
}
