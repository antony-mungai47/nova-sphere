"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function saveSearch(query: string, filters: Record<string, string>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Must be logged in to save searches");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) throw new Error("User not found");

  await prisma.savedSearch.create({
    data: {
      userId: dbUser.id,
      query,
      filters: JSON.stringify(filters)
    }
  });

  return { success: true };
}
