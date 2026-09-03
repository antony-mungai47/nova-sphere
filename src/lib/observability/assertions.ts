export type AssertionSeverity = 'Fatal' | 'Warning' | 'Info';

export interface AssertionViolation {
  ruleId: string;
  severity: AssertionSeverity;
  message: string;
  traceId: string;
  source: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Store global assertion state surviving HMR
const globalWithAssertions = globalThis as unknown as { 
  __RUNTIME_ASSERTIONS__: {
    providerInstances: Map<string, Map<string, number>>; // traceId -> providerName -> activeCount
    activeTraces: Map<string, { startTime: number; source: string; completed: boolean }>;
    violations: AssertionViolation[];
  } 
};

if (!globalWithAssertions.__RUNTIME_ASSERTIONS__) {
  globalWithAssertions.__RUNTIME_ASSERTIONS__ = {
    providerInstances: new Map(),
    activeTraces: new Map(),
    violations: []
  };
}

const state = globalWithAssertions.__RUNTIME_ASSERTIONS__;

export class RuntimeGate {
  /**
   * StrictMode-Aware Singleton Provider Assertion
   * Tracks active concurrent instances in the React tree (increment on mount, decrement on unmount).
   * React StrictMode mounts & unmounts sequentially (count = 1).
   * Actual duplicate providers result in concurrent instances (count > 1).
   */
  static registerProviderMount(providerName: string, traceId: string, source: string = 'ReactTree'): AssertionViolation | null {
    if (!state.providerInstances.has(traceId)) {
      state.providerInstances.set(traceId, new Map());
    }
    const traceMap = state.providerInstances.get(traceId)!;
    const currentCount = (traceMap.get(providerName) || 0) + 1;
    traceMap.set(providerName, currentCount);

    if (currentCount > 1) {
      const violation: AssertionViolation = {
        ruleId: 'GATE_SINGLETON_PROVIDER',
        severity: 'Fatal',
        message: `[RUNTIME_GATE] Fatal: Multiple active concurrent instances of ${providerName} detected in React tree (count: ${currentCount}).`,
        traceId,
        source,
        timestamp: new Date().toISOString(),
        metadata: { providerName, activeCount: currentCount }
      };

      state.violations.push(violation);

      if (process.env.NODE_ENV !== 'production') {
        console.error(violation.message);
      }
      return violation;
    }
    return null;
  }

  static registerProviderUnmount(providerName: string, traceId: string): void {
    if (state.providerInstances.has(traceId)) {
      const traceMap = state.providerInstances.get(traceId)!;
      const currentCount = traceMap.get(providerName) || 0;
      if (currentCount > 1) {
        traceMap.set(providerName, currentCount - 1);
      } else {
        traceMap.delete(providerName);
      }
    }
  }

  /**
   * Repository Ownership Assertion
   * Enforces that Presentation/React layer never directly accesses Repositories without an Application Service/Facade.
   */
  static assertRepositoryOwner(caller: string, traceId: string): AssertionViolation | null {
    if (!caller.includes('Service') && !caller.includes('Facade')) {
      const violation: AssertionViolation = {
        ruleId: 'GATE_REPOSITORY_OWNERSHIP',
        severity: 'Fatal',
        message: `[RUNTIME_GATE] Fatal: Repository accessed directly by unauthorized layer: ${caller}`,
        traceId,
        source: caller,
        timestamp: new Date().toISOString()
      };

      state.violations.push(violation);

      if (process.env.NODE_ENV !== 'production') {
        console.error(violation.message);
      }
      return violation;
    }
    return null;
  }

  /**
   * Gate 11: Orphan Trace Detection
   * Tracks request start and verifies trace termination (REQUEST_COMPLETED / REQUEST_FAILED).
   */
  static startTraceTracking(traceId: string, source: string): void {
    state.activeTraces.set(traceId, {
      startTime: Date.now(),
      source,
      completed: false
    });
  }

  static completeTraceTracking(traceId: string): void {
    const trace = state.activeTraces.get(traceId);
    if (trace) {
      trace.completed = true;
      state.activeTraces.delete(traceId);
    }
  }

  static detectOrphanTraces(maxAgeMs: number = 30000): AssertionViolation[] {
    const now = Date.now();
    const orphans: AssertionViolation[] = [];

    for (const [traceId, trace] of state.activeTraces.entries()) {
      if (!trace.completed && (now - trace.startTime) > maxAgeMs) {
        const violation: AssertionViolation = {
          ruleId: 'GATE_11_ORPHAN_TRACE',
          severity: 'Warning',
          message: `[GATE 11] Warning: Trace ${traceId} from ${trace.source} started ${Math.round((now - trace.startTime)/1000)}s ago and did not terminate.`,
          traceId,
          source: trace.source,
          timestamp: new Date().toISOString(),
          metadata: { durationMs: now - trace.startTime }
        };
        orphans.push(violation);
        state.violations.push(violation);
        state.activeTraces.delete(traceId); // Avoid duplicate alerts
      }
    }
    return orphans;
  }

  /**
   * Gate 13: Reservation Balance
   * Invariant: available + reserved + committed = total stock
   */
  static assertInventoryBalance(
    available: number,
    reserved: number,
    committed: number,
    totalStock: number,
    traceId: string
  ): AssertionViolation | null {
    if (available + reserved + committed !== totalStock) {
      const violation: AssertionViolation = {
        ruleId: 'GATE_13_INVENTORY_BALANCE',
        severity: 'Fatal',
        message: `[GATE 13] Fatal: Inventory balance corrupted. available(${available}) + reserved(${reserved}) + committed(${committed}) !== totalStock(${totalStock})`,
        traceId,
        source: 'InventoryCommandService',
        timestamp: new Date().toISOString(),
        metadata: { available, reserved, committed, totalStock }
      };

      state.violations.push(violation);

      if (process.env.NODE_ENV !== 'production') {
        console.error(violation.message);
      }
      return violation;
    }
    return null;
  }

  /**
   * Gate 14: Tenant Isolation Boundary
   * Enforces that artifacts from one tenant cannot be applied or processed in the context of another.
   */
  static assertTenantIsolation(
    contextTenantId: string,
    resourceTenantId: string,
    resourceType: string,
    resourceId: string,
    traceId: string
  ): AssertionViolation | null {
    if (contextTenantId !== resourceTenantId) {
      const violation: AssertionViolation = {
        ruleId: 'GATE_14_TENANT_ISOLATION',
        severity: 'Fatal',
        message: `[GATE 14] Fatal: Tenant isolation breach detected. Resource ${resourceType}(${resourceId}) owned by tenant '${resourceTenantId}' was accessed in context of tenant '${contextTenantId}'.`,
        traceId,
        source: 'TenantIsolationInterceptor',
        timestamp: new Date().toISOString(),
        metadata: { contextTenantId, resourceTenantId, resourceType, resourceId }
      };

      state.violations.push(violation);

      if (process.env.NODE_ENV !== 'production') {
        console.error(violation.message);
      }
      return violation;
    }
    return null;
  }

  static getViolations(): AssertionViolation[] {
    return state.violations;
  }

  static clearViolations(): void {
    state.violations = [];
  }
}
