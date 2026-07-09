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

    // Rate Limiting (20 bids / 30 seconds per user)
    const now = Date.now();
    const rateLimitWindow = 30000;
    const maxBids = 20;
    
    let userRate = rateLimitMap.get(userId);
    if (!userRate || now > userRate.resetAt) {
      userRate = { count: 1, resetAt: now + rateLimitWindow };
      rateLimitMap.set(userId, userRate);
    } else {
      userRate.count++;
      if (userRate.count > maxBids) {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
      }
    }

    const body = await req.json();
    const { amount, currency, isProxyBid, maximumBid } = body;
    idempotencyKey = req.headers.get('Idempotency-Key');

    if (!idempotencyKey) {
      return NextResponse.json({ error: 'Idempotency-Key header required' }, { status: 400 });
    }

    if (idempotencyMap.has(idempotencyKey)) {
      const cached = idempotencyMap.get(idempotencyKey);
      if (cached === 'PROCESSING') {
        return NextResponse.json({ error: 'Concurrent request processing' }, { status: 409 });
      }
      return NextResponse.json(cached, { status: 200 });
    }
    
    // Mark as processing to prevent race conditions
    idempotencyMap.set(idempotencyKey, 'PROCESSING');

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

    const responsePayload = { success: true, bid: result.newBid };
    idempotencyMap.set(idempotencyKey, responsePayload);

    return NextResponse.json(responsePayload, { status: 201 });

  } catch (error: any) {
    console.error('[Bid API Error]', error);
    if (idempotencyKey) {
      idempotencyMap.delete(idempotencyKey);
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}
