import { NextResponse } from "next/server";
import { IdentityService } from "@/modules/identity/services/IdentityService";
import { CheckoutOrchestratorService, CheckoutConflictError } from "@/modules/commerce/application/sagas/CheckoutOrchestratorService";
import { PrismaCheckoutSagaStateStore } from "@/modules/commerce/application/sagas/PrismaCheckoutSagaStateStore";
import { StripeGateway } from "@/modules/commerce/infrastructure/gateways/StripeGateway";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { W3CTraceContextValidator } from "@/lib/observability/W3CTraceContextValidator";
import { CheckoutCanaryRouter } from "@/modules/commerce/application/routing/CheckoutCanaryRouter";
import { CheckoutMetrics } from "@/modules/commerce/application/sagas/CheckoutMetrics";

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const user = await IdentityService.getOrCreateUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // C3-01: Authenticated Tenant Authority
    // We retrieve the authoritative tenant from the authenticated context.
    const tenantId = (user as any).tenantId || "system";
    
    // Optional consistency check against client-supplied header
    const xTenantId = req.headers.get("x-tenant-id");
    if (xTenantId && xTenantId !== tenantId) {
       return new NextResponse("Tenant identity mismatch", { status: 403 });
    }

    const idempotencyKey = req.headers.get("Idempotency-Key");
    if (!idempotencyKey) {
      return new NextResponse("Idempotency-Key header is required", { status: 400 });
    }

    // C3-04 / Gate 22-T: Validate traceparent against W3C specification
    const rawTraceparent = req.headers.get("traceparent");
    let traceId: string;
    if (rawTraceparent) {
      const parsed = W3CTraceContextValidator.parse(rawTraceparent);
      if (!parsed.valid) {
        return new NextResponse(`Invalid traceparent format: ${parsed.error}`, { status: 400 });
      }
      traceId = `${parsed.version}-${parsed.traceId}-${parsed.parentId}-${parsed.traceFlags}`;
    } else {
      traceId = W3CTraceContextValidator.getOrGenerate(null);
    }

    const body = await req.json();
    const { items, total } = body;

    if (!items || items.length === 0) {
      return new NextResponse("Items are required", { status: 400 });
    }

    const store = new PrismaCheckoutSagaStateStore(prisma);
    const routingDecision = await CheckoutCanaryRouter.evaluateRouting(tenantId, idempotencyKey, store);

    if (!routingDecision.routeToSaga) {
      // Legacy Checkout Route Fallback
      const durationMs = Date.now() - startTime;
      CheckoutMetrics.increment("checkout_requests_total", 1, { checkoutPath: "legacy", tenantCohort: routingDecision.tenantCohort });
      CheckoutMetrics.recordDuration("checkout_request_duration_ms", durationMs, { checkoutPath: "legacy", tenantCohort: routingDecision.tenantCohort });

      return NextResponse.json({
        engine: "legacy",
        status: "REDIRECT_LEGACY",
        checkoutUrl: `https://checkout.novasphere.io/legacy?tenant=${tenantId}&key=${idempotencyKey}`
      }, {
        headers: {
          "x-checkout-path": "legacy",
          "x-deployment-revision": routingDecision.deploymentRevision,
          "x-canary-stage": routingDecision.canaryStage,
          "x-tenant-cohort": routingDecision.tenantCohort,
          "traceparent": traceId
        }
      });
    }

    const paymentProvider = new StripeGateway();
    const orchestrator = new CheckoutOrchestratorService(store, paymentProvider);

    // Provide a default checkout ID in case this is a brand new saga
    // For idempotency conflicts, the orchestrator will return the existing checkoutId.
    const checkoutId = randomUUID();

    const result = await orchestrator.startCheckout({
      checkoutId,
      tenantId,
      idempotencyKey,
      traceId
    }, {
      items,
      userId: user.id,
      clientTotal: total
    });

    const durationMs = Date.now() - startTime;
    CheckoutMetrics.increment("checkout_requests_total", 1, { checkoutPath: "saga", tenantCohort: routingDecision.tenantCohort });
    CheckoutMetrics.recordDuration("checkout_request_duration_ms", durationMs, { checkoutPath: "saga", tenantCohort: routingDecision.tenantCohort });

    return NextResponse.json(result, {
      headers: {
        "x-checkout-path": "saga",
        "x-deployment-revision": routingDecision.deploymentRevision,
        "x-canary-stage": routingDecision.canaryStage,
        "x-tenant-cohort": routingDecision.tenantCohort,
        "traceparent": traceId
      }
    });
  } catch (error: any) {
    console.error("[CHECKOUT_ERROR]", error);
    CheckoutMetrics.increment("checkout_errors_total", 1, { checkoutPath: "saga" });
    if (error instanceof CheckoutConflictError) {
      return new NextResponse(error.message, { status: 409 });
    }
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
