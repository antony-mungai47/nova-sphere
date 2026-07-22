import { AuctionRepository } from "../infrastructure/repositories/AuctionRepository";
import { BidValidator } from "../domain/BidValidator";
import { OutboxRepository } from "../infrastructure/repositories/OutboxRepository";
import { prisma } from "@/lib/prisma";

export class BidService {
  static async placeBid(auctionId: string, userId: string, amount: number) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch auction state
      const auction = await tx.auction.findUnique({
        where: { id: auctionId }
      });
      if (!auction) throw new Error("Auction not found");

      // 2. Pure Domain Validation
      BidValidator.validate(amount, userId, auction);

      const previousHighestBidderId = auction.highestBidderId;

      // 3. Persist Bid
      const bid = await AuctionRepository.placeBid(auctionId, userId, amount, tx);

      // 4. Append Event (Current Bidder)
      await OutboxRepository.appendEvent("BidPlaced", {
        bidId: bid.id,
        auctionId,
        userId,
        amount
      }, auctionId, tx);

      // 5. Append Event (Outbid Notification)
      if (previousHighestBidderId && previousHighestBidderId !== userId) {
        await OutboxRepository.appendEvent("Outbid", {
          auctionId,
          userId: previousHighestBidderId,
          newHighestAmount: amount
        }, auctionId, tx);
      }

      return bid;
    });
  }
}
