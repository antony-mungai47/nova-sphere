import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_SECRET = process.env.ADMIN_API_SECRET || "nova-admin-secret-key";

/**
 * Sanitizes payload data to prevent exposure of sensitive payment details or credentials.
 */
function sanitizeSagaRecord(record: any) {
  if (!record) return record;
  const sanitized = { ...record };
  if (sanitized.payload && typeof sanitized.payload === 'object') {
    const p = { ...sanitized.payload };
    // Remove or mask sensitive payment fields
    if (p.paymentReference) p.paymentReference = p.paymentReference.substring(0, 8) + '...';
    if (p.checkoutUrl) p.checkoutUrl = '[REDACTED_CHECKOUT_URL]';
    sanitized.payload = p;
  }
  return sanitized;
}

export async function GET(req: Request) {
  try {
    // 1. RBAC / Authorization Gate
    const authHeader = req.headers.get("authorization") || req.headers.get("x-admin-token");
    const token = authHeader?.replace("Bearer ", "");
    if (!token || token !== ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 401 });
    }

    const url = new URL(req.url);
    const traceId = url.searchParams.get("traceId");
    const idempotencyKey = url.searchParams.get("idempotencyKey");
    const tenantId = url.searchParams.get("tenantId");

    // 2. Pagination controls
    const limitParam = parseInt(url.searchParams.get("limit") || "20", 10);
    const limit = Math.min(Math.max(1, isNaN(limitParam) ? 20 : limitParam), 50); // Cap at 50
    const offsetParam = parseInt(url.searchParams.get("offset") || "0", 10);
    const offset = Math.max(0, isNaN(offsetParam) ? 0 : offsetParam);

    // 3. Health Scans
    const baseWhere: any = tenantId ? { tenantId } : {};

    // Sagas where payment authorized but order not created
    const ambiguousPaymentsCount = await prisma.checkoutSagaState.count({
      where: { ...baseWhere, paymentAuthorized: true, orderCreated: false }
    });

    // Sagas with inventory reserved but abandoned in failure/compensation
    const strandedInventoryCount = await prisma.checkoutSagaState.count({
      where: { ...baseWhere, inventoryReserved: true, currentState: { in: ['FAILED', 'COMPENSATING'] } }
    });

    // Sagas stuck requiring manual reconciliation
    const manualReconciliationCount = await prisma.checkoutSagaState.count({
      where: { ...baseWhere, currentState: 'FAILED', lastError: 'STUCK_FOR_24H_REQUIRES_MANUAL_RECONCILIATION' }
    });

    // 4. Targeted or Paginated Records
    let records: any[] = [];
    if (traceId || idempotencyKey) {
      records = await prisma.checkoutSagaState.findMany({
        where: {
          ...baseWhere,
          OR: [
            { traceId: traceId || undefined },
            { idempotencyKey: idempotencyKey || undefined }
          ]
        },
        include: { transitions: { orderBy: { step: 'asc' } } },
        take: limit
      });
    } else {
      records = await prisma.checkoutSagaState.findMany({
        where: {
          ...baseWhere,
          OR: [
            { paymentAuthorized: true, orderCreated: false },
            { inventoryReserved: true, currentState: { in: ['FAILED', 'COMPENSATING'] } },
            { currentState: 'FAILED', lastError: 'STUCK_FOR_24H_REQUIRES_MANUAL_RECONCILIATION' }
          ]
        },
        include: { transitions: { orderBy: { step: 'asc' } } },
        skip: offset,
        take: limit,
        orderBy: { updatedAt: 'desc' }
      });
    }

    // 5. Audit Logging of Admin Access
    

    return NextResponse.json({
      health: {
        ambiguousPayments: ambiguousPaymentsCount,
        strandedInventory: strandedInventoryCount,
        manualReconciliation: manualReconciliationCount
      },
      pagination: {
        limit,
        offset,
        count: records.length
      },
      items: records.map(sanitizeSagaRecord)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
