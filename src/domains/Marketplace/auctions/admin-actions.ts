"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { AuctionService } from "./AuctionService";

export async function createAuctionAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Very basic authorization for demo. Real app should check role === 'ADMIN' or 'VENDOR'
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required.");
  }

  const productId = formData.get("productId") as string;
  const baseAmount = Number(formData.get("baseAmount"));
  const reservePriceRaw = formData.get("reservePrice");
  const buyNowPriceRaw = formData.get("buyNowPrice");
  const startTimeRaw = formData.get("startTime");
  const endTimeRaw = formData.get("endTime");

  const reservePrice = reservePriceRaw ? Number(reservePriceRaw) : undefined;
  const buyNowPrice = buyNowPriceRaw ? Number(buyNowPriceRaw) : undefined;
  const startTime = startTimeRaw ? new Date(startTimeRaw as string) : undefined;
  const endTime = new Date(endTimeRaw as string);

  try {
    const auction = await AuctionService.createAuction({
      productId,
      baseAmount,
      reservePrice,
      buyNowPrice,
      startTime,
      endTime,
    });

    revalidatePath("/admin/auctions");
    revalidatePath("/auctions");

    return { success: true, auctionId: auction.id };
  } catch (error: any) {
    console.error("Failed to create auction:", error);
    return { success: false, error: error.message || "Failed to create auction." };
  }
}
