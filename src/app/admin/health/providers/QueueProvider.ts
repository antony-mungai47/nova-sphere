import { IOperationsProvider } from "./types";

export interface QueueMetrics {
  pending: number;
  running: number;
  retrying: number;
  dlq: number;
  oldestPendingJobTime: string;
  retrySuccessPercent: number;
  averageProcessingTimeMs: number;
  maxQueueDelayMs: number;
}

export async function getQueueProvider(): Promise<IOperationsProvider<QueueMetrics>> {
  return {
    state: "NOT_CONFIGURED",
    lastChecked: null,
    latencyMs: null,
    source: "Inngest API",
    data: null
  };
}
