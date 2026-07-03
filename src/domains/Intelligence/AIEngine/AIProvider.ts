import { type ModelMessage, type ToolSet } from 'ai';

export interface AIProviderOptions {
  model?: string;
  systemPrompt?: string;
  messages: ModelMessage[];
  tools?: ToolSet;
  maxSteps?: number;
}

export interface AIProvider {
  /**
   * Generates a complete text response.
   */
  generate(options: AIProviderOptions): Promise<any>;

  /**
   * Streams a text response.
   */
  stream(options: AIProviderOptions): Promise<any>;

  /**
   * Generates embeddings for search or context matching.
   */
  embed(text: string): Promise<number[]>;

  /**
   * Moderates input/output against safety guidelines.
   */
  moderate(text: string): Promise<{ safe: boolean; reason?: string }>;
}
