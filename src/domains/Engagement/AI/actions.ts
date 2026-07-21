"use server";

import { auth } from "@clerk/nextjs/server";
import { IdentityService } from "@/modules/identity/services/IdentityService";
import { AISupportService } from "./AISupportService";

export async function generateSummaryAction(conversationId: string) {
  const authorized = await IdentityService.isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  return await AISupportService.generateSummary(conversationId);
}

export async function generateSuggestedRepliesAction(conversationId: string) {
  const authorized = await IdentityService.isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  return await AISupportService.generateSuggestedReplies(conversationId);
}

export async function triggerAutoReplyAction(conversationId: string) {
  // Can be triggered by the user sending a message, or by a background job
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await AISupportService.triggerAutoReply(conversationId);
  return { success: true };
}
