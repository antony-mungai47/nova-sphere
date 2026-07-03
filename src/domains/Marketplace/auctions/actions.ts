"use server";

import { inngest } from '@/lib/inngest/client';
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function placeBid(auctionId: string, amount: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("You must be logged in to place a bid.");
  }

  // Find the user in our DB
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    throw new Error("User profile not found.");
  }

  // Fetch auction and validate
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
  });

  if (!auction) {
    throw new Error("Auction not found.");
  }

  if (auction.status !== "LIVE") {
    throw new Error("This auction is no longer active.");
  }

  if (new Date() > auction.endTime) {
    throw new Error("This auction has ended.");
  }

  const minBid = Math.max(auction.baseAmount.toNumber(), Number(auction.currentBid.toString()) + 1); // require at least $1 more than current
  if (amount < minBid) {
    throw new Error(`Your bid must be at least $${minBid.toFixed(2)}.`);
  }

  // Use a transaction to ensure no race conditions on placing a bid
  const newBid = await prisma.$transaction(async (tx) => {
    const currentAuction = await tx.auction.findUnique({
      where: { id: auctionId },
    });

    if (!currentAuction || amount <= currentAuction.currentBid.toNumber()) {
      throw new Error("Someone else just placed a higher bid!");
    }

    const bid = await tx.bid.create({
      data: {
        auctionId,
        userId: user.id,
        amount,
      },
    });

    // Anti-sniping: extend auction if less than 5 minutes remain
    const fiveMinutes = 5 * 60 * 1000;
    const timeRemaining = currentAuction.endTime.getTime() - new Date().getTime();
    let newEndTime = currentAuction.endTime;
    if (timeRemaining < fiveMinutes) {
      newEndTime = new Date(currentAuction.endTime.getTime() + fiveMinutes);
      await tx.auction.update({
        where: { id: auctionId },
        data: { currentBid: amount, endTime: newEndTime },
      });
    } else {
      await tx.auction.update({
        where: { id: auctionId },
        data: { currentBid: amount },
      });
    }

    return { bid, newEndTime };
  });

  revalidatePath(`/auctions/${auctionId}`);
  revalidatePath(`/auctions`);
  
  return newBid;
}
