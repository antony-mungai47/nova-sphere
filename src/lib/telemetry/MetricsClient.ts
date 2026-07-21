// Stub for a Metrics Client that could send to Datadog / Prometheus
export class MetricsClient {
  static async increment(metricName: string, value: number = 1, tags: Record<string, string> = {}) {
    // In production, this pushes to a time-series database.
    console.log(`[METRICS] ${metricName} +${value} ${JSON.stringify(tags)}`);
  }

  static async timing(metricName: string, latencyMs: number, tags: Record<string, string> = {}) {
    console.log(`[METRICS] ${metricName} ${latencyMs}ms ${JSON.stringify(tags)}`);
  }
}
