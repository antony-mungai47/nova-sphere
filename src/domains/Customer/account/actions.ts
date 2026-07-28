"use server";

import { prisma } from "@/lib/prisma";
import { IdentityFacade } from "@/modules/identity/IdentityFacade";
import { revalidatePath } from "next/cache";

export async function saveSearch(query: string, filters?: any) {
  const dbUser = await IdentityFacade.getCurrentUser();
  if (!dbUser) {
    throw new Error("You must be signed in to save searches.");
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
  const dbUser = await IdentityFacade.getCurrentUser();
  if (!dbUser) {
    throw new Error("Unauthorized");
  }

  await prisma.savedSearch.deleteMany({
    where: { id, userId: dbUser.id }
  });

  revalidatePath("/account");
}
