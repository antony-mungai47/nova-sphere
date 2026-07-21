export type ProviderState = "CONNECTED" | "UNAVAILABLE" | "NOT_CONFIGURED";

export interface IOperationsProvider<T = any> {
  state: ProviderState;
  lastChecked: Date | null;
  latencyMs: number | null;
  source: string;
  data: T | null;
}
