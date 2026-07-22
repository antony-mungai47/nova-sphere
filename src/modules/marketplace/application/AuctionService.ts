import { AuctionRepository } from "../infrastructure/repositories/AuctionRepository";
import { AuctionStateMachine } from "../domain/AuctionStateMachine";
import { OutboxRepository } from "../infrastructure/repositories/OutboxRepository";
import { prisma } from "@/lib/prisma";

export class AuctionService {
  static async publish(auctionId: string) {
    return prisma.$transaction(async (tx) => {
      const auction = await AuctionRepository.getAuction(auctionId);
      if (!auction) throw new Error("Auction not found");

      // Validate transition from current to SCHEDULED
      AuctionStateMachine.validateTransition(auction.status, "SCHEDULED");

      await tx.auction.update({
        where: { id: auctionId },
        data: { status: "SCHEDULED" }
      });

      await OutboxRepository.appendEvent("AuctionPublished", { auctionId }, auctionId, tx);
    });
  }

  static async pause(auctionId: string) {
    return prisma.$transaction(async (tx) => {
      const auction = await AuctionRepository.getAuction(auctionId);
      if (!auction) throw new Error("Auction not found");

      AuctionStateMachine.validateTransition(auction.status, "PAUSED");

      await tx.auction.update({
        where: { id: auctionId },
        data: { status: "PAUSED" }
      });

      await OutboxRepository.appendEvent("AuctionPaused", { auctionId }, auctionId, tx);
    });
  }

  static async close(auctionId: string) {
    return prisma.$transaction(async (tx) => {
      const auction = await AuctionRepository.getAuction(auctionId);
      if (!auction) throw new Error("Auction not found");

      AuctionStateMachine.validateTransition(auction.status, "CLOSED");

      await tx.auction.update({
        where: { id: auctionId },
        data: { status: "CLOSED" }
      });

      await OutboxRepository.appendEvent("AuctionClosed", { auctionId }, auctionId, tx);
    });
  }
}
