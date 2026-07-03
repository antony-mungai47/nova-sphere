import { prisma } from '@/lib/prisma';
import { AuctionStatus, Prisma } from '@prisma/client';
import { RealtimeEngine } from '../Realtime/RealtimeEngine';

export class AuctionEngine {
  
  /**
   * Transitions an auction to a new state and broadcasts the event.
   */
  static async transitionState(auctionId: string, newState: AuctionStatus) {
    const updated = await prisma.auction.update({
      where: { id: auctionId },
      data: { status: newState }
    });

    await RealtimeEngine.broadcast(`auction-${auctionId}`, 'state-changed', {
      status: newState
    });

    return updated;
  }

  /**
   * Determines if the reserve price is met without exposing the reserve price.
   */
  static isReserveMet(currentBid: Prisma.Decimal, reservePrice: Prisma.Decimal | null): boolean {
    if (!reservePrice) return true; // No reserve means it's always met once a bid exists
    return currentBid.gte(reservePrice);
  }

  static async getActiveAuctions() {
    return prisma.auction.findMany({
      where: { status: AuctionStatus.LIVE },
      orderBy: { endTime: 'asc' }
    });
  }
}
