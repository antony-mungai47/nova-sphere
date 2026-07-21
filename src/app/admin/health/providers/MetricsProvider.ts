import { IOperationsProvider } from "./types";

export interface SLOMetrics {
  apiUptime: number;
  paymentUptime: number;
  auctionUptime: number;
  searchUptime: number;
  aiUptime: number;
  targetUptime: number;
  remainingErrorBudgetPercent: number;
  burnRate: number;
  incidentCount: number;
  mttrMinutes: number;
}

export async function getMetricsProvider(): Promise<IOperationsProvider<SLOMetrics>> {
  return {
    state: "NOT_CONFIGURED",
    lastChecked: null,
    latencyMs: null,
    source: "Datadog / Prometheus",
    data: null
  };
}
