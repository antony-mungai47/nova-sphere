import { IAIProvider } from '../providers/IAIProvider';
import { VercelAIProvider } from '../providers/VercelAIProvider';

export class SupportAgent {
  private provider: IAIProvider;

  constructor() {
    // In a real scenario, this could be instantiated based on config/feature flags
    this.provider = new VercelAIProvider();
  }

  async generateSummary(chatHistory: string): Promise<string> {
    const prompt = `
      You are an expert customer support AI. Please summarize the following conversation 
      for a human agent who is about to take over. Include the core issue, customer sentiment, 
      and what steps have already been attempted.
      
      Conversation:
      ${chatHistory}
    `;
    
    // Simulate API call
    return await this.provider.generateText(prompt);
  }

  async generateSuggestedReplies(chatHistory: string): Promise<string[]> {
    const prompt = `
      Based on the following conversation, generate 3 concise, helpful suggested replies 
      for the support agent to send.
      
      Conversation:
      ${chatHistory}
    `;

    const response = await this.provider.generateText(prompt);
    // In a real app, parse this into an array. For now, simulate:
    return [
      "I understand the issue, let me check your order details right away.",
      "Could you please provide a screenshot of the error you're seeing?",
      "I've issued a refund for your order, it should process in 3-5 business days."
    ];
  }

  async autoReply(chatHistory: string): Promise<string> {
    const prompt = `
      You are Nova AI, the first-line support agent. Provide a helpful, concise response 
      to the user based on the conversation history. If you cannot help, say you will connect them to a human.
      
      Conversation:
      ${chatHistory}
    `;

    return await this.provider.generateText(prompt);
  }
}
