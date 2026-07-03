import { prisma } from '@/lib/prisma';
import { BidStatus, Prisma } from '@prisma/client';
import { RealtimeEngine } from '../Realtime/RealtimeEngine';

export class BidEngine {
  
  static async placeBid({
    auctionId,
    userId,
    amount,
    currency,
    isProxyBid = false,
    maximumBid = null
  }: {
    auctionId: string;
    userId: string;
    amount: Prisma.Decimal;
    currency: string;
    isProxyBid?: boolean;
    maximumBid?: Prisma.Decimal | null;
  }) {
    // 0. Fraud Validation (Throws if malicious)
    const { AuctionFraudEngine } = await import('./AuctionFraudEngine');
    await AuctionFraudEngine.validateBidRisk(auctionId, userId, amount);

    // 1. Transaction to handle the bid logic safely
    const result = await prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id: auctionId }
      });

      if (!auction || auction.status !== 'LIVE') {
        throw new Error('Auction is not live.');
      }

      // Check if bid is high enough
      if (amount.lte(auction.currentBid)) {
        throw new Error('Bid amount must be strictly greater than the current bid.');
      }

      // Create new bid
      const newBid = await tx.bid.create({
        data: {
          auctionId,
          userId,
          amount,
          currency,
          isProxyBid,
          maximumBid,
          status: BidStatus.ACCEPTED
        }
      });

      // Update previous highest bid to OUTBID
      if (auction.highestBidderId) {
        await tx.bid.updateMany({
          where: {
            auctionId,
            userId: auction.highestBidderId,
            status: BidStatus.ACCEPTED
          },
          data: { status: BidStatus.OUTBID }
        });
      }

      // Record to immutable ledger
      await tx.bidLedger.create({
        data: {
          bidId: newBid.id,
          auctionId,
          userId,
          amount,
          currency,
          type: 'PLACE'
        }
      });

      // Update auction
      const updatedAuction = await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentBid: amount,
          highestBidderId: userId,
        }
      });

      return { newBid, updatedAuction };
    });

    // 2. Broadcast via Realtime Engine
    await RealtimeEngine.broadcast(`auction-${auctionId}`, 'bid-placed', {
      amount: result.newBid.amount,
      highestBidderId: result.newBid.userId
    });

    // 3. Evaluate Anti-Sniping
    import('./AntiSnipingEngine').then(m => m.AntiSnipingEngine.evaluateSnipe(auctionId));

    // 4. Evaluate Proxy Bids (unless this bid was already a proxy bid resolving itself)
    if (!isProxyBid) {
      import('./ProxyBidEngine').then(m => m.ProxyBidEngine.evaluateProxyBids(auctionId));
    }

    return result;
  }
}
