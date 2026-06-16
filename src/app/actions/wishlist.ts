"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function toggleWishlist(productId: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Must be logged in to modify wishlist");
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
}
