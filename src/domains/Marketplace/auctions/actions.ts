"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { AuctionService } from "./AuctionService";

export async function placeBid(auctionId: string, amount: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("You must be logged in to place a bid.");
  }

  try {
    const result = await AuctionService.placeBid(auctionId, userId, amount);
    
    // Revalidate relevant UI paths
    revalidatePath(`/auctions/${auctionId}`);
    revalidatePath(`/auctions`);
    
    return result;
  } catch (error: any) {
    throw new Error(error.message || "Failed to place bid");
  }
}

export async function buyNow(auctionId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("You must be logged in to buy now.");
  }

  try {
    const result = await AuctionService.buyNow(auctionId, userId);
    revalidatePath(`/auctions/${auctionId}`);
    revalidatePath(`/auctions`);
    return result;
  } catch (error: any) {
    throw new Error(error.message || "Failed to buy now");
  }
}

