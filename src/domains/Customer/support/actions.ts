"use server";

import { auth } from "@clerk/nextjs/server";
import { ConversationService } from "@/domains/Engagement/Conversation/ConversationService";
import { ParticipantRole } from "@prisma/client";
import { AISupportService } from "@/domains/Engagement/AI/AISupportService";

export async function getActiveCustomerConversationAction() {
  const { userId } = await auth();
  if (!userId) return null;

  // We find active conversations for this user
  const conversations = await ConversationService.getUserConversations(userId);
  const active = conversations.find(c => c.status === "ACTIVE");
  
  if (active) {
    // Re-fetch to get all messages, not just the preview
    return await ConversationService.getConversation(active.id);
  }
  
  return null;
}

export async function createCustomerConversationAction(message: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const conversation = await ConversationService.createConversation({
    title: "Customer Support Request",
    creatorId: userId,
    creatorRole: ParticipantRole.CUSTOMER,
    initialMessage: message,
  });

  if (!conversation) throw new Error("Failed to create conversation");

  // Automatically trigger Nova AI response for new conversations
  // Add a small delay so it feels natural
  setTimeout(() => {
    AISupportService.triggerAutoReply(conversation.id).catch(console.error);
  }, 1000);

  return conversation;
}

export async function sendCustomerMessageAction(conversationId: string, content: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const message = await ConversationService.sendMessage(conversationId, userId, content);

  // We can choose to let AI auto-reply to everything or just specific triggers.
  // For now, let's let Nova AI reply to every user message if no human is active.
  setTimeout(() => {
    AISupportService.triggerAutoReply(conversationId).catch(console.error);
  }, 1000);

  return message;
}
