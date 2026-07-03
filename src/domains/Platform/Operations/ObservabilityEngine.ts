import { randomUUID } from 'crypto';

export type LogLevel = 'DEBUG' | 'INFO' | 'NOTICE' | 'WARN' | 'ERROR' | 'CRITICAL' | 'FATAL';

export interface LogContext {
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  service: string;
  domain: string;
  userId?: string;
  tenantId?: string;
  operation: string;
  durationMs?: number;
}

export class ObservabilityEngine {
  /**
   * Generates a new unique Trace ID for distributed tracing.
   */
  static generateTraceId(): string {
    return randomUUID();
  }

  /**
   * Generates a new unique Span ID.
   */
  static generateSpanId(): string {
    return randomUUID().substring(0, 16);
  }

  /**
   * Standardized structured JSON logging.
   */
  static log(level: LogLevel, message: string, context: LogContext, metadata?: Record<string, any>) {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      ...context,
      message,
      metadata: metadata || {}
    };

    // In a real NOC environment, this might stream to Datadog, ELK, or New Relic.
    // For now, we write structured JSON to standard out.
    console.log(JSON.stringify(payload));
  }
}
