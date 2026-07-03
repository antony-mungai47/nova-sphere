import { prisma } from '@/lib/prisma';
import { EscalationEngine } from './EscalationEngine';

export class NovaAITriageService {
  /**
   * Processes a customer support message through AI.
   * If confidence is low, automatically escalates to a human ticket.
   */
  static async handleMessage(userId: string, conversationId: string, messageContent: string) {
    // In reality, this would pass the message to Vercel AI SDK and request a confidence score in the tool schema
    const mockAiResponse = "I can help with that. Your order is currently being processed.";
    const mockConfidence = 0.95; 

    if (mockConfidence < 0.90) {
      await EscalationEngine.escalateToHuman(userId, conversationId, messageContent, "Low AI Confidence");
      return "I'm escalating your request to a human agent. They will be with you shortly.";
    }

    return mockAiResponse;
  }
}
