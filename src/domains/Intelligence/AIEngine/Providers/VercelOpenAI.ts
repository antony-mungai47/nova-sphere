import { AIProvider, AIProviderOptions } from '../AIProvider';
import { generateText as aiGenerateText, streamText as aiStreamText, embed as aiEmbed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

export class VercelOpenAI implements AIProvider {
  
  async generate(options: AIProviderOptions) {
    const { text, toolCalls, toolResults, finishReason, usage } = await aiGenerateText({
      model: openai(options.model || 'gpt-4o-mini'),
      system: options.systemPrompt,
      messages: options.messages,
      tools: options.tools,
    });
    
    return { text, toolCalls, toolResults, finishReason, usage };
  }

  async stream(options: AIProviderOptions) {
    return aiStreamText({
      model: openai(options.model || 'gpt-4o-mini'),
      system: options.systemPrompt,
      messages: options.messages,
      tools: options.tools,
    });
  }

  async embed(text: string): Promise<number[]> {
    const { embedding } = await aiEmbed({
      model: openai.embedding('text-embedding-3-small'),
      value: text,
    });
    return embedding;
  }

  async moderate(text: string): Promise<{ safe: boolean; reason?: string }> {
    // In a real implementation, use OpenAI moderation endpoint or a fast classifier.
    // For now, we mock success.
    return { safe: true };
  }
}
