import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrismaCheckoutSagaStateStore } from "@/modules/commerce/application/sagas/PrismaCheckoutSagaStateStore";
import { CheckoutOrchestratorService } from "@/modules/commerce/application/sagas/CheckoutOrchestratorService";
import { StripeGateway } from "@/modules/commerce/infrastructure/gateways/StripeGateway";
import { CheckoutEvent, CheckoutState } from "@/modules/commerce/application/sagas/CheckoutSaga.types";
import { CheckoutMetrics } from "@/modules/commerce/application/sagas/CheckoutMetrics";

const ADMIN_SECRET = process.env.ADMIN_API_SECRET || "nova-admin-secret-key";

export async function POST(req: Request) {
  try {
    // 1. RBAC Check
    const authHeader = req.headers.get("authorization") || req.headers.get("x-admin-token");
    const token = authHeader?.replace("Bearer ", "");
    if (!token || token !== ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 401 });
    }

    const body = await req.json();
    const { checkoutId, tenantId, action, expectedVersion, operatorId, reason } = body;

    if (!checkoutId || !tenantId || !action || !operatorId || !reason) {
      return NextResponse.json({ 
        error: "Missing required fields: checkoutId, tenantId, action, operatorId, reason" 
      }, { status: 400 });
    }

    const store = new PrismaCheckoutSagaStateStore(prisma);
    const saga = await store.loadByTenant(checkoutId, tenantId);

    if (!saga) {
      return NextResponse.json({ error: "Saga not found or tenant mismatch" }, { status: 404 });
    }

    // 2. OCC Version Check if expectedVersion supplied
    if (expectedVersion !== undefined && saga.version !== expectedVersion) {
      return NextResponse.json({ 
        error: `OCC Conflict: Saga current version is ${saga.version}, expected ${expectedVersion}` 
      }, { status: 409 });
    }

    const previousState = saga.currentState;
    const orchestrator = new CheckoutOrchestratorService(store, new StripeGateway());

    let resultingState: CheckoutState = saga.currentState;

    switch (action) {
      case "FORCE_COMPENSATE":
        if (saga.currentState !== CheckoutState.COMPENSATING) {
          saga.compensationRequired = true;
          saga.currentState = CheckoutState.COMPENSATING;
          saga.version++;
          await store.save(saga);
        }
        await orchestrator.resume(saga);
        break;

      case "FORCE_RETRY":
        await orchestrator.resume(saga);
        break;

      case "MARK_RESOLVED":
        saga.currentState = CheckoutState.ROLLED_BACK;
        saga.lastError = `MANUALLY_RESOLVED by ${operatorId}: ${reason}`;
        saga.version++;
        await store.save(saga);
        break;

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    const updated = await store.loadByTenant(checkoutId, tenantId);
    resultingState = updated?.currentState || resultingState;

    // 3. Audit Trail Logging
    

    CheckoutMetrics.increment("admin_manual_reconcile_total", 1, { action, tenantId });

    return NextResponse.json({
      success: true,
      checkoutId,
      previousState,
      currentState: resultingState,
      version: updated?.version
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
