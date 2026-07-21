import { useSignals } from "../../signals/sdk/hooks"; // In real usage, this would be imported or injected

export interface AIEvaluationMetric {
  provider: string;
  model: string;
  promptName: string;
  latencyMs: number;
  costEstimate: number;
  qualityScore?: number; // 0-1, calculated asynchronously or via feedback
  hallucinated?: boolean;
}

/**
 * Tracks telemetry for AI performance: Latency, Cost, Quality, Provider.
 */
export class EvaluationEngine {
  
  public async recordMetrics(metric: AIEvaluationMetric): Promise<void> {
    // Write to actual AILog
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.promptLog.create({
        data: {
          provider: metric.provider || "unknown",
          model: metric.model,
          promptTokens: 0,
          completionTokens: 0,
          latencyMs: metric.latencyMs,
        }
      });
      console.log(`[EvaluationEngine] AI Log recorded to DB for ${metric.provider}/${metric.model}`);
    } catch (e) {
      console.error(`[EvaluationEngine] Failed to write AILog to DB`, e);
    }
    
    // Example: Triggering a signal event for analytics (using the global console/logger for now as it's a backend engine)
    if (metric.latencyMs > 5000) {
      console.warn(`[EvaluationEngine] High latency detected on ${metric.provider}`);
    }
  }

  public trackFailure(provider: string, reason: string): void {
    console.error(`[EvaluationEngine] AI Failure on ${provider}: ${reason}`);
  }
}

export const GlobalEvaluation = new EvaluationEngine();
