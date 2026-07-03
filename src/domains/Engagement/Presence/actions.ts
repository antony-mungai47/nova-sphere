"use server";

import { auth } from "@clerk/nextjs/server";
import { PresenceService } from "./PresenceService";

export async function broadcastTypingAction(conversationId: string, isTyping: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await PresenceService.broadcastTyping(conversationId, userId, isTyping);
  return { success: true };
}

export async function broadcastStatusAction(status: "ONLINE" | "OFFLINE" | "AWAY" | "IDLE") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await PresenceService.broadcastStatus(userId, status);
  return { success: true };
}
