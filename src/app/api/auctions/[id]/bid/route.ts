import { prisma } from "@/lib/prisma";
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { BidEngine } from '@/domains/Auction/BidEngine';

// In-memory rate limiting and idempotency (Mock for Sprint 7)
// In production, use Redis (e.g. @upstash/ratelimit)
const rateLimitMap = new Map<string, { count: number, resetAt: number }>();
const idempotencyMap = new Map<string, any>();

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let idempotencyKey: string | null = null;
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate Limiting (20 bids / 30 seconds per user) using V3 SignalsLedger
    const recentBids = await prisma.signalsLedger.count({
      where: {
        userId,
        eventType: 'AUCTION_BID',
        createdAt: { gte: new Date(Date.now() - 30000) }
      }
    });

    if (recentBids >= 20) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }

    const body = await req.json();
    const { amount, currency, isProxyBid, maximumBid } = body;
    idempotencyKey = req.headers.get('Idempotency-Key');

    if (!idempotencyKey) {
      return NextResponse.json({ error: 'Idempotency-Key header required' }, { status: 400 });
    }

    // Idempotency using V3 WorkflowState
    const existingWorkflow = await prisma.workflowState.findUnique({
      where: { correlationId: idempotencyKey }
    });

    if (existingWorkflow) {
      if (existingWorkflow.status === 'PENDING') {
        return NextResponse.json({ error: 'Concurrent request processing' }, { status: 409 });
      }
      return NextResponse.json(existingWorkflow.payload as any, { status: 200 });
    }
    
    // Mark as processing
    await prisma.workflowState.create({
      data: {
        correlationId: idempotencyKey,
        workflowType: 'AUCTION_BID',
        status: 'PENDING',
        currentState: 'RECEIVED'
      }
    });

    // Convert amounts to Decimal
    const decimalAmount = new Prisma.Decimal(amount);
    const decimalMax = maximumBid ? new Prisma.Decimal(maximumBid) : null;

    const result = await BidEngine.placeBid({
      auctionId: id,
      userId,
      amount: decimalAmount,
      currency: currency || 'USD',
      isProxyBid: !!isProxyBid,
      maximumBid: decimalMax
    });

    // Record the signal for rate limiting
    await prisma.signalsLedger.create({
      data: {
        userId,
        eventType: 'AUCTION_BID', sessionId: 'none', payload: { auctionId: id, amount }
      }
    });

    const responsePayload = { success: true, bid: result.newBid };
    
    await prisma.workflowState.update({
      where: { correlationId: idempotencyKey },
      data: { status: 'COMPLETED', currentState: 'PLACED', payload: responsePayload as any }
    });

    return NextResponse.json(responsePayload, { status: 201 });

  } catch (error: any) {
    console.error('[Bid API Error]', error);
    if (idempotencyKey) {
      await prisma.workflowState.delete({ where: { correlationId: idempotencyKey } }).catch(() => {});
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}
