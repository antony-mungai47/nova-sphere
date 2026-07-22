import { AuctionRepository } from "../infrastructure/repositories/AuctionRepository";
import { OutboxRepository } from "../infrastructure/repositories/OutboxRepository";
import { AuctionStateMachine } from "../domain/AuctionStateMachine";
import { prisma } from "@/lib/prisma";

export class WinnerResolutionService {
  static async resolve(auctionId: string) {
    return prisma.$transaction(async (tx) => {
      const auction = await AuctionRepository.getAuction(auctionId);
      if (!auction) throw new Error("Auction not found");

      AuctionStateMachine.validateTransition(auction.status, "SETTLED");

      const winnerId = auction.highestBidderId;
      const winningAmount = auction.currentBid;

      await tx.auction.update({
        where: { id: auctionId },
        data: { status: "SETTLED" }
      });

      if (winnerId && winningAmount.greaterThan(0)) {
        // Emit events for decoupled processing
        await OutboxRepository.appendEvent("AuctionWon", {
          auctionId,
          winnerId,
          amount: winningAmount
        }, auctionId, tx);

        await OutboxRepository.appendEvent("OrderCreationRequested", {
          auctionId,
          userId: winnerId,
          amount: winningAmount,
          productId: auction.productId
        }, auctionId, tx);

        // Here we could also query all other unique bidders and emit AuctionLost
      } else {
        await OutboxRepository.appendEvent("AuctionEndedWithoutWinner", {
          auctionId
        }, auctionId, tx);
      }
    });
  }
}
