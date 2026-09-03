import { Telemetry, EventType } from "@/lib/observability/Telemetry";
import { RuntimeGate } from "@/lib/observability/assertions";

export interface ChaosScenarioResult {
  scenario: string;
  traceId: string;
  simulatedFailure: string;
  handledSuccessfully: boolean;
  durationMs: number;
}

export class ChaosSuite {
  /**
   * Simulates a controlled Stripe API timeout
   */
  static async simulateStripeTimeout(traceId: string): Promise<ChaosScenarioResult> {
    const start = Date.now();
    const spanId = crypto.randomUUID().replace(/-/g, '').substring(0, 16);

    Telemetry.record({
      layer: 'Infrastructure',
      type: EventType.ExternalIOCall,
      source: 'StripePaymentGateway.createPaymentIntent',
      traceId,
      spanId,
      metadata: { target: 'api.stripe.com', status: 'SIMULATED_TIMEOUT' }
    });

    // Simulate 200ms delay then synthetic failure
    await new Promise(res => setTimeout(res, 200));

    const durationMs = Date.now() - start;

    Telemetry.record({
      layer: 'Infrastructure',
      type: EventType.RequestFailed,
      source: 'StripePaymentGateway.createPaymentIntent',
      traceId,
      spanId,
      durationMs,
      metadata: { error: 'GatewayTimeout: Stripe API call exceeded 200ms threshold' }
    });

    return {
      scenario: 'Stripe API Timeout',
      traceId,
      simulatedFailure: 'GatewayTimeout: Stripe API call timed out',
      handledSuccessfully: true,
      durationMs
    };
  }

  /**
   * Simulates a controlled Prisma Database Latency Spike
   */
  static async simulatePrismaLatency(traceId: string, delayMs: number = 500): Promise<ChaosScenarioResult> {
    const start = Date.now();
    const spanId = crypto.randomUUID().replace(/-/g, '').substring(0, 16);

    Telemetry.record({
      layer: 'Infrastructure',
      type: EventType.RepositoryCall,
      source: 'OrderRepository.findByIdWithItems',
      traceId,
      spanId,
      metadata: { status: 'LATENCY_INJECTED', targetDelayMs: delayMs }
    });

    await new Promise(res => setTimeout(res, delayMs));

    const durationMs = Date.now() - start;

    Telemetry.record({
      layer: 'Infrastructure',
      type: EventType.RepositoryCall,
      source: 'OrderRepository.findByIdWithItems',
      traceId,
      spanId,
      durationMs,
      metadata: { status: 'COMPLETED_WITH_LATENCY' }
    });

    return {
      scenario: 'Prisma DB Latency Spike',
      traceId,
      simulatedFailure: `DB Latency Injected (${delayMs}ms)`,
      handledSuccessfully: true,
      durationMs
    };
  }

  /**
   * Simulates an Orphan Trace (Gate 11)
   */
  static async simulateOrphanTrace(traceId: string): Promise<ChaosScenarioResult> {
    const start = Date.now();
    
    // Start tracking without completing
    RuntimeGate.startTraceTracking(traceId, 'ChaosSuite.simulateOrphanTrace');

    Telemetry.record({
      layer: 'Presentation',
      type: EventType.RouteEntered,
      source: '/api/checkout/simulate-orphan',
      traceId,
      spanId: 'span_orphan_001'
    });

    return {
      scenario: 'Gate 11 Orphan Trace Simulation',
      traceId,
      simulatedFailure: 'Trace started without RequestCompleted or RequestFailed event',
      handledSuccessfully: true,
      durationMs: Date.now() - start
    };
  }
}
