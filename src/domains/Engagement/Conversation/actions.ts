"use server";

import { auth } from "@clerk/nextjs/server";
import { IdentityService } from "@/modules/identity/services/IdentityService";
import { ConversationService, CreateConversationDto } from "./ConversationService";
import { MessageDeliveryState, ParticipantRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createConversationAction(title?: string, initialMessage?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const conversation = await ConversationService.createConversation({
    creatorId: userId,
    creatorRole: ParticipantRole.CUSTOMER,
    title,
    initialMessage,
  });

  return conversation;
}

export async function addParticipantAction(conversationId: string, targetUserId: string, role: ParticipantRole) {
  const authorized = await IdentityService.isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  const participant = await ConversationService.addParticipant(conversationId, targetUserId, role);
  return participant;
}

export async function sendMessageAction(conversationId: string, content: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const message = await ConversationService.sendMessage(conversationId, userId, content);
  
  // Later: dispatch to event bus / realtime engine here
  
  return message;
}

export async function markConversationAsReadAction(conversationId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await ConversationService.markAsRead(conversationId, userId);
  return { success: true };
}

export async function updateMessageDeliveryStateAction(messageId: string, state: MessageDeliveryState) {
  // Can be called by clients to acknowledge receipt/read
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  // Note: in a fully secure app, you'd verify that the user has permission to update this message's state.
  const message = await ConversationService.updateMessageDeliveryState(messageId, state);
  return message;
}

export async function getUserConversationsAction() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const conversations = await ConversationService.getUserConversations(userId);
  return conversations;
}
