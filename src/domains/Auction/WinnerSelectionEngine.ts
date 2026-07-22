import { prisma } from '@/lib/prisma';
import { AuctionStatus, BidStatus } from '@prisma/client';
import { RealtimeEngine } from '../Realtime/RealtimeEngine';
import { AuctionEngine } from './AuctionEngine';

export class WinnerSelectionEngine {
  
  static async finalizeAuction(auctionId: string) {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        bids: {
          orderBy: { amount: 'desc' }
        }
      }
    });

    if (!auction) throw new Error('Auction not found');
    if (auction.status === 'CLOSED' || auction.status === 'SETTLED') return;

    if (auction.bids.length === 0 || !auction.highestBidderId) {
      // No bids, auction ended
      await AuctionEngine.transitionState(auctionId, AuctionStatus.CLOSED);
      return;
    }

    const reserveMet = AuctionEngine.isReserveMet(auction.currentBid, auction.reservePrice);
    
    if (!reserveMet) {
      await AuctionEngine.transitionState(auctionId, AuctionStatus.CLOSED);
      // Mark all bids as rejected because reserve wasn't met
      await prisma.bid.updateMany({
        where: { auctionId },
        data: { status: BidStatus.REJECTED }
      });
      return;
    }

    // Reserve met, we have a winner
    await prisma.$transaction(async (tx) => {
      // Mark the highest bid as WINNING
      await tx.bid.updateMany({
        where: {
          auctionId,
          userId: auction.highestBidderId!
        },
        data: { status: BidStatus.WINNING }
      });

      // State is AWAITING_PAYMENT until capture succeeds
      await tx.auction.update({
        where: { id: auctionId },
        data: { status: AuctionStatus.SETTLED }
      });
    });

    await RealtimeEngine.broadcast(`presence-auction-${auctionId}`, 'auction-ended-winner', {
      auctionId,
      winnerId: auction.highestBidderId,
      winningAmount: auction.currentBid,
      timestamp: new Date().toISOString()
    });

    // Write OutboxEvent for AuctionCloseSaga to orchestrate Order and Payment
    await prisma.outboxEvent.create({
      data: {
        aggregateId: auctionId,
        eventType: 'AuctionWon',
        payload: {
          auctionId,
          winnerId: auction.highestBidderId,
          winningAmount: auction.currentBid,
          currency: auction.baseCurrency || 'USD'
        }
      }
    });
  }
}
