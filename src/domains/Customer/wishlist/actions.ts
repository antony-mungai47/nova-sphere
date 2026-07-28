"use server";

import { IdentityFacade } from "@/modules/identity/IdentityFacade";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function toggleWishlist(productId: string) {
  const dbUser = await IdentityFacade.getOrCreateUser();
  if (!dbUser) {
    return { status: "LOCAL_ONLY" };
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
  const dbUser = await IdentityFacade.getOrCreateUser();
  if (!dbUser) return { status: "LOCAL_ONLY" };

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
