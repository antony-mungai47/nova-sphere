"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function saveSearch(query: string, filters?: any) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("You must be signed in to save searches.");
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) {
    throw new Error("User not found.");
  }

  const existingSearch = await prisma.savedSearch.findFirst({
    where: { userId: dbUser.id, query }
  });

  if (existingSearch) {
    throw new Error("You have already saved this search.");
  }

  await prisma.savedSearch.create({
    data: {
      userId: dbUser.id,
      query,
      filters: filters ? JSON.stringify(filters) : undefined
    }
  });

  revalidatePath("/account");
  return { success: true };
}

export async function deleteSavedSearch(id: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return;

  await prisma.savedSearch.deleteMany({
    where: { id, userId: dbUser.id }
  });

  revalidatePath("/account");
}
