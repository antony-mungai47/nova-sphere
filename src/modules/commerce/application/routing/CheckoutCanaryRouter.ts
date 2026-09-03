import { PrismaCheckoutSagaStateStore } from "@/modules/commerce/application/sagas/PrismaCheckoutSagaStateStore";

export interface RoutingDecision {
  routeToSaga: boolean;
  isPinned: boolean;
  reason: string;
  checkoutPath: "saga" | "legacy";
  tenantCohort: string;
  canaryStage: string;
  deploymentRevision: string;
}

export class CheckoutCanaryRouter {
  /**
   * Deterministically decides whether a checkout request routes to the Saga Orchestrator or Legacy Path.
   * 
   * Invariants:
   * 1. Saga Pinning: If an idempotency key was previously processed or initiated by the Saga orchestrator,
   *    all subsequent retries remain pinned to the Saga path, even if traffic is rolled back.
   * 2. Tenant Allowlisting: Stage 2 cohort evaluates against allowed tenant identifiers.
   * 3. Deterministic Hashing: Tenant-based bucket hash ensures sticky routing across non-pinned calls.
   * 4. Rollout Identity: Annotates every decision with revision, cohort, stage, and path for telemetry.
   */
  public static async evaluateRouting(
    tenantId: string, 
    idempotencyKey: string, 
    store: PrismaCheckoutSagaStateStore
  ): Promise<RoutingDecision> {
    const deploymentRevision = process.env.DEPLOYMENT_REVISION || "v3.4.0";
    const canaryStage = process.env.CANARY_STAGE || "STAGE_2";

    // 1. Saga Pinning Check (Highest Priority)
    const existing = await store.loadByTenantAndIdempotencyKey(tenantId, idempotencyKey);
    if (existing) {
      return { 
        routeToSaga: true, 
        isPinned: true, 
        reason: "PINNED_EXISTING_SAGA",
        checkoutPath: "saga",
        tenantCohort: "cohort-affinity-pinned",
        canaryStage,
        deploymentRevision
      };
    }

    // 2. Global Feature Flag Kill Switch
    if (process.env.CHECKOUT_SAGA_ENABLED === "false") {
      return { 
        routeToSaga: false, 
        isPinned: false, 
        reason: "DISABLED_KILL_SWITCH",
        checkoutPath: "legacy",
        tenantCohort: "fleet-baseline",
        canaryStage,
        deploymentRevision
      };
    }

    // 3. Stage 2 Allowlist Evaluation
    const allowlisted = (process.env.CHECKOUT_SAGA_ALLOWED_TENANTS || "")
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    if (allowlisted.length > 0 && allowlisted.includes(tenantId)) {
      return { 
        routeToSaga: true, 
        isPinned: false, 
        reason: "TENANT_ALLOWLISTED",
        checkoutPath: "saga",
        tenantCohort: "canary-cohort-alpha",
        canaryStage,
        deploymentRevision
      };
    }

    // 4. Percentage-Based Traffic Shifting (Stages 3 & 4)
    const canaryPercentage = parseInt(process.env.CHECKOUT_SAGA_CANARY_PERCENTAGE || "100", 10);
    if (canaryPercentage >= 100) {
      return { 
        routeToSaga: true, 
        isPinned: false, 
        reason: "FULL_PRODUCTION",
        checkoutPath: "saga",
        tenantCohort: "fleet-standard",
        canaryStage,
        deploymentRevision
      };
    }

    if (canaryPercentage <= 0) {
      return { 
        routeToSaga: false, 
        isPinned: false, 
        reason: "STAGE_0_OR_ZERO_PERCENT",
        checkoutPath: "legacy",
        tenantCohort: "fleet-baseline",
        canaryStage,
        deploymentRevision
      };
    }

    // Deterministic murmur-style hash on tenantId
    let hash = 0;
    for (let i = 0; i < tenantId.length; i++) {
      hash = (hash << 5) - hash + tenantId.charCodeAt(i);
      hash |= 0;
    }
    const bucket = Math.abs(hash) % 100;
    const routeToSaga = bucket < canaryPercentage;

    return { 
      routeToSaga, 
      isPinned: false, 
      reason: routeToSaga ? "CANARY_PERCENTAGE_INCLUDED" : "CANARY_PERCENTAGE_EXCLUDED",
      checkoutPath: routeToSaga ? "saga" : "legacy",
      tenantCohort: routeToSaga ? "canary-cohort-beta" : "fleet-baseline",
      canaryStage,
      deploymentRevision
    };
  }
}
