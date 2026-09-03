export interface MetricTags {
  [key: string]: string | number | boolean | undefined;
}

export class CheckoutMetrics {
  // In-memory telemetry registry for testing & scraping
  private static counters = new Map<string, number>();
  private static gauges = new Map<string, number>();
  private static histograms = new Map<string, number[]>();

  private static formatMetricKey(name: string, tags?: MetricTags): string {
    const defaultTags: MetricTags = {
      deploymentRevision: process.env.DEPLOYMENT_REVISION || "v3.4.0",
      canaryStage: process.env.CANARY_STAGE || "STAGE_2",
      checkoutPath: "saga"
    };
    const mergedTags = { ...defaultTags, ...(tags || {}) };
    const tagStr = Object.entries(mergedTags)
      .filter(([_, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${tagStr}}`;
  }

  public static increment(name: string, value: number = 1, tags?: MetricTags): void {
    const key = this.formatMetricKey(name, tags);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
  }

  public static gauge(name: string, value: number, tags?: MetricTags): void {
    const key = this.formatMetricKey(name, tags);
    this.gauges.set(key, value);
  }

  public static recordDuration(name: string, durationMs: number, tags?: MetricTags): void {
    const key = this.formatMetricKey(name, tags);
    const values = this.histograms.get(key) || [];
    values.push(durationMs);
    this.histograms.set(key, values);
  }

  public static getCounter(name: string, tags?: MetricTags): number {
    const key = this.formatMetricKey(name, tags);
    return this.counters.get(key) || 0;
  }

  public static getGauge(name: string, tags?: MetricTags): number | undefined {
    const key = this.formatMetricKey(name, tags);
    return this.gauges.get(key);
  }

  public static getHistogramStats(name: string, tags?: MetricTags): { count: number; p50: number; p90: number; p99: number; avg: number } {
    const key = this.formatMetricKey(name, tags);
    const values = this.histograms.get(key) || [];
    if (values.length === 0) {
      return { count: 0, p50: 0, p90: 0, p99: 0, avg: 0 };
    }
    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;
    const p50 = sorted[Math.floor(count * 0.5)];
    const p90 = sorted[Math.floor(count * 0.9)];
    const p99 = sorted[Math.floor(count * 0.99)] || sorted[count - 1];
    const avg = sorted.reduce((sum, v) => sum + v, 0) / count;
    return { count, p50, p90, p99, avg };
  }

  public static getSnapshot(): {
    counters: Record<string, number>;
    gauges: Record<string, number>;
    histograms: Record<string, { count: number; p50: number; p90: number; p99: number; avg: number }>;
  } {
    const counters: Record<string, number> = {};
    for (const [k, v] of this.counters.entries()) counters[k] = v;

    const gauges: Record<string, number> = {};
    for (const [k, v] of this.gauges.entries()) gauges[k] = v;

    const histograms: Record<string, any> = {};
    for (const [k] of this.histograms.entries()) {
      const values = this.histograms.get(k) || [];
      const sorted = [...values].sort((a, b) => a - b);
      const count = sorted.length;
      histograms[k] = {
        count,
        p50: sorted[Math.floor(count * 0.5)] || 0,
        p90: sorted[Math.floor(count * 0.9)] || 0,
        p99: sorted[Math.floor(count * 0.99)] || sorted[count - 1] || 0,
        avg: count ? sorted.reduce((sum, v) => sum + v, 0) / count : 0
      };
    }

    return { counters, gauges, histograms };
  }

  public static getComparativeAnalysis(): {
    saga: { count: number; p99: number; errors: number; successRate: number };
    legacy: { count: number; p99: number; errors: number; successRate: number };
    latencyRatio: number;
    errorRateDelta: number;
  } {
    const sagaStats = this.getHistogramStats("checkout_request_duration_ms", { checkoutPath: "saga" });
    const legacyStats = this.getHistogramStats("checkout_request_duration_ms", { checkoutPath: "legacy" });

    const sagaTotal = this.getCounter("checkout_requests_total", { checkoutPath: "saga" });
    const sagaErrors = this.getCounter("checkout_errors_total", { checkoutPath: "saga" });
    const sagaSuccessRate = sagaTotal > 0 ? ((sagaTotal - sagaErrors) / sagaTotal) * 100 : 100;

    const legacyTotal = this.getCounter("checkout_requests_total", { checkoutPath: "legacy" });
    const legacyErrors = this.getCounter("checkout_errors_total", { checkoutPath: "legacy" });
    const legacySuccessRate = legacyTotal > 0 ? ((legacyTotal - legacyErrors) / legacyTotal) * 100 : 100;

    const latencyRatio = legacyStats.p99 > 0 ? sagaStats.p99 / legacyStats.p99 : 1.0;
    const errorRateDelta = (sagaTotal > 0 ? (sagaErrors / sagaTotal) : 0) - (legacyTotal > 0 ? (legacyErrors / legacyTotal) : 0);

    return {
      saga: { count: sagaTotal, p99: sagaStats.p99, errors: sagaErrors, successRate: sagaSuccessRate },
      legacy: { count: legacyTotal, p99: legacyStats.p99, errors: legacyErrors, successRate: legacySuccessRate },
      latencyRatio,
      errorRateDelta
    };
  }

  public static reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}
