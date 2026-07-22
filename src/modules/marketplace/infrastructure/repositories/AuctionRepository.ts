import { prisma } from "@/lib/prisma";
import { AuctionStatus } from "@prisma/client";

export class AuctionRepository {
  static async getAuction(id: string) {
    return prisma.auction.findUnique({
      where: { id },
      include: {
        product: true
      }
    });
  }

  static async updateAuctionState(id: string, state: AuctionStatus) {
    return prisma.auction.update({
      where: { id },
      data: { status: state }
    });
  }

  static async placeBid(auctionId: string, userId: string, amount: number, tx?: any) {
    const db = tx || prisma;
    
    // Create the bid
    const bid = await db.bid.create({
      data: {
        auctionId,
        userId,
        amount,
        status: "ACCEPTED"
      }
    });

    // Update the auction current bid and highest bidder
    await db.auction.update({
      where: { id: auctionId },
      data: {
        currentBid: amount,
        highestBidderId: userId
      }
    });

    // Add to ledger
    await db.bidLedger.create({
      data: {
        bidId: bid.id,
        auctionId,
        userId,
        amount,
        currency: "USD",
        type: "PLACE"
      }
    });

    return bid;
  }
}
