export type EventLayer = 'Presentation' | 'Application' | 'Infrastructure' | 'System';

export enum EventType {
  // Presentation
  RouteEntered = 'RouteEntered',
  LayoutMounted = 'LayoutMounted',

  // Application
  ServiceInvoked = 'ServiceInvoked',
  StateTransition = 'StateTransition',

  // Infrastructure
  RepositoryCall = 'RepositoryCall',
  ExternalIOCall = 'ExternalIOCall',
  CacheHit = 'CacheHit',
  CacheMiss = 'CacheMiss',

  // Request Lifecycle (Gate 11 - Orphan Trace Protection)
  RequestCompleted = 'RequestCompleted',
  RequestFailed = 'RequestFailed',

  // System & Assertions
  RuntimeAssertion = 'RuntimeAssertion',
  PerformanceWarning = 'PerformanceWarning'
}

export interface BaseRuntimeEvent {
  eventId: string;
  timestamp: string;
  layer: EventLayer;
  type: EventType | string;
  source: string;
  
  // W3C Trace Context
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  traceparent?: string;
  tracestate?: string;
  
  // App Context
  userId?: string;
  tenantId?: string;
  sessionId?: string;
  
  // Performance
  durationMs?: number;
  
  metadata?: Record<string, any>;
}

export type RecordEventPayload = Omit<BaseRuntimeEvent, 'eventId' | 'timestamp'>;

// Pluggable Exporter Interface
export interface TelemetryExporter {
  export(event: BaseRuntimeEvent): void;
  getEvents?(): BaseRuntimeEvent[];
}

class RingBuffer<T> {
  private buffer: (T | null)[];
  private capacity: number;
  private head: number;
  private tail: number;
  private size: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(capacity).fill(null);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  push(item: T) {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.size < this.capacity) {
      this.size++;
    } else {
      this.tail = (this.tail + 1) % this.capacity;
    }
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.tail;
    for (let i = 0; i < this.size; i++) {
      result.push(this.buffer[current] as T);
      current = (current + 1) % this.capacity;
    }
    return result;
  }
}

export class DevRingBufferAdapter implements TelemetryExporter {
  private ringBuffer: RingBuffer<BaseRuntimeEvent>;

  constructor(capacity: number = 10000) {
    const globalWithTelemetry = globalThis as unknown as { __TELEMETRY_BUFFER__: RingBuffer<BaseRuntimeEvent> };
    if (!globalWithTelemetry.__TELEMETRY_BUFFER__) {
      globalWithTelemetry.__TELEMETRY_BUFFER__ = new RingBuffer<BaseRuntimeEvent>(capacity);
    }
    this.ringBuffer = globalWithTelemetry.__TELEMETRY_BUFFER__;
  }

  export(event: BaseRuntimeEvent): void {
    this.ringBuffer.push(event);
  }

  getEvents(): BaseRuntimeEvent[] {
    return this.ringBuffer.toArray();
  }
}

export class OpenTelemetryExporter implements TelemetryExporter {
  export(event: BaseRuntimeEvent): void {
    // In production, this emits to OTel collector / Datadog / Grafana Tempo
    if (process.env.NODE_ENV === 'production') {
      // Standard structured JSON logging for log aggregation / OTel collector sidecar
      console.log(JSON.stringify({ otelSpan: event }));
    }
  }
}

// Telemetry Sampling Policy
export class TelemetryPolicy {
  static shouldSample(source: string, type: string): boolean {
    // 100% sampling for Critical Write & High-Value operations
    if (source.includes('Checkout') || source.includes('Order') || source.includes('Payment') || type === EventType.RuntimeAssertion) {
      return true;
    }
    // 25% sampling for Catalog & Search
    if (source.includes('Product') || source.includes('Search')) {
      return Math.random() < 0.25;
    }
    // 1% sampling for Health checks
    if (source.includes('Health') || source.includes('api/health')) {
      return Math.random() < 0.01;
    }
    // Default 50% sampling for other operational events in production
    return process.env.NODE_ENV !== 'production' || Math.random() < 0.5;
  }
}

// Singleton Exporters
const devAdapter = new DevRingBufferAdapter();
const otelAdapter = new OpenTelemetryExporter();

export const EventRingBuffer = devAdapter;

export class Telemetry {
  static record(payload: RecordEventPayload) {
    if (!TelemetryPolicy.shouldSample(payload.source, payload.type as string)) {
      return;
    }

    const event: BaseRuntimeEvent = {
      ...payload,
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    // Always export to Dev Adapter in dev/test environment
    devAdapter.export(event);

    // Export to OTel Exporter in production
    if (process.env.NODE_ENV === 'production') {
      otelAdapter.export(event);
    }

    if (payload.layer === 'System') {
      console.warn(`[TELEMETRY SYSTEM EVENT] ${payload.type} from ${payload.source}`, payload.metadata);
    }
  }

  static getEvents(): BaseRuntimeEvent[] {
    return devAdapter.getEvents();
  }
}
