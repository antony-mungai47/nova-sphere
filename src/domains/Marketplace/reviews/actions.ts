"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function submitReview(productId: string, rating: number, content: string, title?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Must be logged in to leave a review");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) throw new Error("User not found");

  if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");
  if (!content.trim()) throw new Error("Review content is required");

  // Create review
  await prisma.review.create({
    data: {
      productId,
      userId: dbUser.id,
      rating,
      content,
      title
    }
  });

  // Recalculate average rating for product
  const allReviews = await prisma.review.findMany({
    where: { productId }
  });

  const reviewCount = allReviews.length;
  const newRating = reviewCount > 0 
    ? allReviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount 
    : 0;

  await prisma.product.update({
    where: { id: productId },
    data: { 
      rating: parseFloat(newRating.toFixed(1)), 
      reviewCount 
    }
  });

  revalidatePath(`/product/${productId}`);
  return { success: true };
}
