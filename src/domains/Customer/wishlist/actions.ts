"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function toggleWishlist(productId: string) {
  const user = await currentUser();
  if (!user) {
    return { status: "LOCAL_ONLY" };
  }

  // Ensure user exists in our DB
  let dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.fullName || user.firstName || "User",
      }
    });
  }

  // Check if it already exists
  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId: dbUser.id,
        productId: productId
      }
    }
  });

  if (existing) {
    await prisma.wishlistItem.delete({
      where: { id: existing.id }
    });
  } else {
    await prisma.wishlistItem.create({
      data: {
        userId: dbUser.id,
        productId: productId
      }
    });
  }

  revalidatePath("/store");
  revalidatePath(`/product/${productId}`);
  revalidatePath("/account");
  
  return { status: "SYNCED" };
}

export async function syncWishlistAction(productIds: string[]) {
  const user = await currentUser();
  if (!user) return { status: "LOCAL_ONLY" };

  let dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return { status: "FAILED", error: "User not found" };

  try {
    await prisma.$transaction(async (tx) => {
      for (const productId of productIds) {
        const existing = await tx.wishlistItem.findUnique({
          where: { userId_productId: { userId: dbUser.id, productId } }
        });
        if (!existing) {
          await tx.wishlistItem.create({
            data: { userId: dbUser.id, productId }
          });
        }
      }
    });
    revalidatePath("/store");
    revalidatePath("/account");
    return { status: "MERGED" };
  } catch (err: any) {
    console.error("Wishlist merge failed:", err);
    return { status: "FAILED", error: err.message };
  }
}
