import { IOperationsProvider } from "./types";

export interface AIProviderMetrics {
  provider: string;
  model: string;
  successPercent: number;
  promptCachePercent: number;
  averageTokens: number;
  averageCost: number;
  budgetRemaining: number;
  failuresToday: number;
}

export async function getAIProvider(): Promise<IOperationsProvider<AIProviderMetrics>> {
  return {
    state: "NOT_CONFIGURED",
    lastChecked: null,
    latencyMs: null,
    source: "AI Gateway Analytics",
    data: null
  };
}
