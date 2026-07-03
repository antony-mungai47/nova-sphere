import { prisma } from "@/lib/prisma";
import { ConversationService } from "../Conversation/ConversationService";
import { SupportAgent } from "@/domains/AI/agents/SupportAgent";

export class AISupportService {
  /**
   * Generates a summary of the conversation up to this point.
   */
  static async generateSummary(conversationId: string): Promise<string> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!conversation) throw new Error("Conversation not found");

    const history = conversation.messages.map(m => `[${m.senderId}]: ${m.content}`).join("\n");
    
    try {
      const agent = new SupportAgent();
      return await agent.generateSummary(history);
    } catch (e) {
      console.error("Failed to generate AI summary:", e);
      return "AI Summary unavailable at this time.";
    }
  }

  /**
   * Generates suggested replies based on the conversation context.
   */
  static async generateSuggestedReplies(conversationId: string): Promise<string[]> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: -10 // Only use the last 10 messages for context
        }
      }
    });

    if (!conversation) throw new Error("Conversation not found");

    const history = conversation.messages.map(m => `[${m.senderId}]: ${m.content}`).join("\n");
    
    try {
      const agent = new SupportAgent();
      return await agent.generateSuggestedReplies(history);
    } catch (e) {
      console.error("Failed to generate AI replies:", e);
      return [];
    }
  }

  /**
   * Generates and dispatches an automatic AI reply.
   */
  static async triggerAutoReply(conversationId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: -5 // context
        }
      }
    });

    if (!conversation) throw new Error("Conversation not found");

    const history = conversation.messages.map(m => `[${m.senderId}]: ${m.content}`).join("\n");
    
    try {
      const agent = new SupportAgent();
      const replyText = await agent.autoReply(history);

      // AI is effectively a "system" or "AI" participant. We use a static AI ID.
      const AI_SYSTEM_ID = "NOVA_AI";
      
      await ConversationService.sendMessage(conversationId, AI_SYSTEM_ID, replyText);
    } catch (e) {
      console.error("Failed to trigger AI auto-reply:", e);
      // Fail gracefully: Do not crash or send a fallback message if it's an auto-reply, just abort.
    }
  }
}
