import { NextResponse } from "next/server";
import { ChaosSuite } from "@/devtools/chaos/chaosSuite";

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Chaos suite is disabled in production' }, { status: 403 });
  }

  const traceId = crypto.randomUUID().replace(/-/g, '');

  const stripeResult = await ChaosSuite.simulateStripeTimeout(traceId);
  const prismaResult = await ChaosSuite.simulatePrismaLatency(traceId, 300);
  const orphanResult = await ChaosSuite.simulateOrphanTrace(traceId);

  return NextResponse.json({
    status: 'Chaos suite executed successfully',
    traceId,
    results: [stripeResult, prismaResult, orphanResult]
  });
}
