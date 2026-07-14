export interface AIProviderResponse {
  content: string;
  tokensUsed: number;
  provider: string;
  model: string;
}

export interface AIProvider {
  name: string;
  execute(prompt: string, model?: string): Promise<AIProviderResponse>;
}

export class OpenAIProvider implements AIProvider {
  name = "openai";
  async execute(prompt: string, model: string = "gpt-4o"): Promise<AIProviderResponse> {
    // Mock implementation for V3.0 infrastructure
    return {
      content: `{"intent": "mock_openai_intent"}`,
      tokensUsed: 120,
      provider: this.name,
      model
    };
  }
}

export class GeminiProvider implements AIProvider {
  name = "gemini";
  async execute(prompt: string, model: string = "gemini-1.5-pro"): Promise<AIProviderResponse> {
    // Mock implementation for V3.0 infrastructure
    return {
      content: `{"intent": "mock_gemini_intent"}`,
      tokensUsed: 80,
      provider: this.name,
      model
    };
  }
}

export class ClaudeProvider implements AIProvider {
  name = "claude";
  async execute(prompt: string, model: string = "claude-3-opus"): Promise<AIProviderResponse> {
    // Mock implementation for V3.0 infrastructure
    return {
      content: `{"intent": "mock_claude_intent"}`,
      tokensUsed: 150,
      provider: this.name,
      model
    };
  }
}
