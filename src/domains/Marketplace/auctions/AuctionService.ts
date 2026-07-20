import { prisma } from "@/lib/prisma";
import { inngest } from "@/lib/inngest/client";
import { pusherServer } from "@/lib/pusherServer";
import { Prisma } from "@prisma/client";

export class AuctionService {
  static async createAuction(params: {
    productId: string;
    baseAmount: number;
    reservePrice?: number;
    buyNowPrice?: number;
    startTime?: Date;
    endTime: Date;
    antiSnipingEnabled?: boolean;
    extensionMinutes?: number;
    extensionThreshold?: number;
  }) {
    const isUpcoming = params.startTime && params.startTime > new Date();
    const initialStatus = isUpcoming ? "SCHEDULED" : "LIVE";

    const auction = await prisma.auction.create({
      data: {
        productId: params.productId,
        baseAmount: params.baseAmount,
        reservePrice: params.reservePrice,
        buyNowPrice: params.buyNowPrice,
        startTime: params.startTime || new Date(),
        endTime: params.endTime,
        status: initialStatus,
        currentBid: params.baseAmount,
        antiSnipingEnabled: params.antiSnipingEnabled ?? true,
        extensionMinutes: params.extensionMinutes ?? 5,
        extensionThreshold: params.extensionThreshold ?? 5,
      },
    });

    await inngest.send({ name: "AuctionCreated", data: { auctionId: auction.id } });

    if (isUpcoming) {
      // Future logic to schedule the start
      // Example: We could use Inngest's step.sleepUntil, but typically we'd schedule it here:
      await inngest.send({ 
        name: "AuctionStarted", 
        data: { auctionId: auction.id } 
      });
    }

    return auction;
  }

  static async validateBid(auction: any, userId: string, amount: number) {
    if (auction.status !== "LIVE") {
      throw new Error("This auction is not active.");
    }

    const now = new Date();
    if (now < new Date(auction.startTime || auction.createdAt) || now > new Date(auction.endTime)) {
      throw new Error("This auction is not currently accepting bids.");
    }

    if (auction.highestBidderId === userId) {
      throw new Error("You are already the highest bidder.");
    }

    const currentBidNum = Number(auction.currentBid.toString());
    const minBid = Math.max(Number(auction.baseAmount.toString()), currentBidNum + 1); // Minimum $1 increment rule
    
    if (amount < minBid) {
      throw new Error(`Your bid must be at least $${minBid.toFixed(2)}.`);
    }
  }

  static async placeBid(auctionId: string, userId: string, amount: number) {
    // We execute inside a Serializable transaction to ensure robust concurrency control
    return await prisma.$transaction(async (tx) => {
      // Lock the auction row (if supported, but Serializable isolation guarantees correctness)
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
      });

      if (!auction) throw new Error("Auction not found.");

      // Run pure validation
      await AuctionService.validateBid(auction, userId, amount);

      const previousBidderId = auction.highestBidderId;
      const previousBidAmount = Number(auction.currentBid.toString());

      // Create the bid history record
      const bid = await tx.bid.create({
        data: {
          auctionId,
          userId,
          amount,
          status: "PENDING", // Could be ACCEPTED right away
        },
      });

      // Anti-sniping logic
      let newEndTime = auction.endTime;
      let extended = false;
      if (auction.antiSnipingEnabled) {
        const timeRemainingMs = new Date(auction.endTime).getTime() - new Date().getTime();
        const thresholdMs = auction.extensionThreshold * 60 * 1000;
        
        if (timeRemainingMs < thresholdMs) {
          newEndTime = new Date(new Date(auction.endTime).getTime() + (auction.extensionMinutes * 60 * 1000));
          extended = true;
        }
      }

      // Update Auction state
      const updatedAuction = await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentBid: amount,
          highestBidderId: userId,
          endTime: newEndTime,
        },
      });

      // Emit Asynchronous Signals (Best effort, non-blocking to the transaction commit ideally, 
      // but placed here so they fire only if the transaction succeeds).
      // Note: In a pure CQRS system, we'd emit these via Postgres CDC or Outbox pattern.
      
      const bidPayload = { auctionId, userId, amount };
      
      // We will invoke side-effects immediately after transaction, but since this is JS:
      // We push the side-effects into the event loop.
      setImmediate(() => {
        pusherServer.trigger(`auction-${auctionId}`, 'bid-placed', bidPayload);
        inngest.send({ name: "AuctionBidPlaced", data: bidPayload });

        if (previousBidderId && previousBidderId !== userId) {
          inngest.send({
            name: "AuctionOutbid",
            data: {
              auctionId,
              userId: previousBidderId,
              previousBidAmount,
              newBidAmount: amount,
            }
          });
        }

        if (extended) {
          inngest.send({
            name: "AuctionExtended",
            data: { auctionId, newEndTime: newEndTime.toISOString() }
          });
          pusherServer.trigger(`auction-${auctionId}`, 'auction-extended', { newEndTime });
        }
      });

      return { bid, updatedAuction };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000, // 5 seconds
      timeout: 10000, // 10 seconds
    });
  }

  static async buyNow(auctionId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({ where: { id: auctionId } });
      if (!auction) throw new Error("Auction not found");
      if (auction.status !== "LIVE") throw new Error("Auction not active");
      if (!auction.buyNowPrice) throw new Error("This auction does not have a Buy Now option.");

      const buyNowAmount = Number(auction.buyNowPrice.toString());

      // Create winning bid
      const bid = await tx.bid.create({
        data: {
          auctionId,
          userId,
          amount: buyNowAmount,
        }
      });

      const updatedAuction = await tx.auction.update({
        where: { id: auctionId },
        data: {
          status: "AWAITING_PAYMENT",
          highestBidderId: userId,
          currentBid: buyNowAmount,
          endTime: new Date(), // End instantly
        }
      });

      setImmediate(() => {
        pusherServer.trigger(`auction-${auctionId}`, 'auction-ended', { reason: 'BUY_NOW', winnerId: userId });
        inngest.send({ name: "AuctionBuyNow", data: { auctionId, userId, amount: buyNowAmount } });
        inngest.send({ name: "AuctionWon", data: { auctionId, winnerId: userId, amount: buyNowAmount } });
      });

      return updatedAuction;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  static async endAuction(auctionId: string) {
    return await prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({ where: { id: auctionId } });
      if (!auction) throw new Error("Auction not found");
      if (auction.status === "ENDED" || auction.status === "CLOSED_NO_SALE" || auction.status === "AWAITING_PAYMENT") return auction;

      const currentBidNum = Number(auction.currentBid.toString());
      const reserveNum = auction.reservePrice ? Number(auction.reservePrice.toString()) : 0;
      
      const reserveMet = !auction.reservePrice || currentBidNum >= reserveNum;
      
      const nextStatus = reserveMet && auction.highestBidderId ? "AWAITING_PAYMENT" : "CLOSED_NO_SALE";

      const updated = await tx.auction.update({
        where: { id: auctionId },
        data: { status: nextStatus }
      });

      setImmediate(() => {
        pusherServer.trigger(`auction-${auctionId}`, 'auction-ended', { status: nextStatus });
        inngest.send({ name: "AuctionEnded", data: { auctionId, winnerId: reserveMet ? auction.highestBidderId || undefined : undefined } });
        
        if (!reserveMet) {
          inngest.send({ name: "AuctionReserveFailed", data: { auctionId, highestBidAmount: currentBidNum } });
        } else if (auction.highestBidderId) {
          inngest.send({ name: "AuctionWon", data: { auctionId, winnerId: auction.highestBidderId, amount: currentBidNum } });
        }
      });

      return updated;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  static async cancelAuction(auctionId: string, reason?: string) {
    const updated = await prisma.auction.update({
      where: { id: auctionId },
      data: { status: "CANCELLED" }
    });

    pusherServer.trigger(`auction-${auctionId}`, 'auction-cancelled', { reason });
    inngest.send({ name: "AuctionCancelled", data: { auctionId, reason } });
    
    return updated;
  }
}
