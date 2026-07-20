import { GlobalAIGateway } from "../gateway/AIGateway";
import { GlobalSafety } from "../safety/SafetyLayer";
import { GlobalEvaluation } from "../evaluation/EvaluationEngine";
import { AIProviderResponse } from "../providers";

export interface OrchestratorOptions {
  provider?: string;
  model?: string;
  fallbackProvider?: string;
  expectedFormat?: "json" | "text";
  maxRetries?: number;
}

export class AIOrchestrator {
  /**
   * High-level method to execute AI tasks with Safety, Telemetry, and Fallbacks.
   */
  public async generate(prompt: string, options: OrchestratorOptions = {}): Promise<string | null> {
    const { 
      provider = "openai", 
      model, 
      fallbackProvider = "gemini",
      expectedFormat = "json",
      maxRetries = 1 
    } = options;

    const startTime = Date.now();
    const sanitizedPrompt = GlobalSafety.sanitizeInput(prompt);

    try {
      const response = await this.attemptGeneration(provider, sanitizedPrompt, model, maxRetries);
      const output = response.content;

      if (!GlobalSafety.validateOutput(output, expectedFormat)) {
        throw new Error(`Output failed validation for format: ${expectedFormat}`);
      }

      GlobalEvaluation.recordMetrics({
        provider: response.provider,
        model: response.model,
        promptName: "orchestrated_prompt",
        latencyMs: Date.now() - startTime,
        costEstimate: (response.tokensUsed / 1000) * 0.01
      });

      // Track AI Budget Usage
      const { GlobalBudgetMonitor } = await import("../safety/BudgetMonitor");
      GlobalBudgetMonitor.trackUsage("general-ai", response.tokensUsed);

      return output;

    } catch (error: any) {
      GlobalEvaluation.trackFailure(provider, error.message);

      // Attempt Fallback
      if (fallbackProvider) {
        console.warn(`[AIOrchestrator] Falling back to ${fallbackProvider}`);
        try {
          const fallbackResponse = await this.attemptGeneration(fallbackProvider, sanitizedPrompt, undefined, 0);
          return fallbackResponse.content;
        } catch (fallbackError: any) {
          GlobalEvaluation.trackFailure(fallbackProvider, fallbackError.message);
        }
      }

      // If all fails, return null so caller can use heuristics
      return null;
    }
  }

  private async attemptGeneration(provider: string, prompt: string, model?: string, retries: number = 0): Promise<AIProviderResponse> {
    try {
      return await GlobalAIGateway.execute(provider, prompt, model);
    } catch (err) {
      if (retries > 0) {
        return this.attemptGeneration(provider, prompt, model, retries - 1);
      }
      throw err;
    }
  }
}

export const GlobalAIOrchestrator = new AIOrchestrator();
