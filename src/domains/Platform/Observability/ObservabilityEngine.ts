export class ObservabilityEngine {
  /**
   * Abstracted metrics tracking (e.g. DataDog, Prometheus)
   */
  static recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    console.log(`[Metrics] ${name}=${value} ${tags ? JSON.stringify(tags) : ''}`);
  }

  /**
   * Tracks latency for an operation
   */
  static async trackLatency<T>(operationName: string, operation: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await operation();
    } finally {
      const duration = performance.now() - start;
      this.recordMetric(`${operationName}_latency_ms`, duration);
    }
  }

  /**
   * Tracks errors
   */
  static recordError(errorName: string, message: string): void {
    console.error(`[ErrorMetric] ${errorName}: ${message}`);
    this.recordMetric('error_count', 1, { errorName });
  }
}
