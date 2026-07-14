import { AIProvider, OpenAIProvider, GeminiProvider, ClaudeProvider, AIProviderResponse } from "../providers";

export class AIGateway {
  private providers: Map<string, AIProvider> = new Map();

  constructor() {
    this.providers.set("openai", new OpenAIProvider());
    this.providers.set("gemini", new GeminiProvider());
    this.providers.set("claude", new ClaudeProvider());
  }

  /**
   * Executes a prompt against a specific provider/model.
   */
  public async execute(providerName: string, prompt: string, model?: string): Promise<AIProviderResponse> {
    const provider = this.providers.get(providerName);
    if (!provider) throw new Error(`Provider ${providerName} not found`);
    return provider.execute(prompt, model);
  }
}

export const GlobalAIGateway = new AIGateway();
