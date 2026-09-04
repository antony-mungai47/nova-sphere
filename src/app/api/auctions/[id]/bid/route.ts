import { prisma } from "@/lib/prisma";
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { BidEngine } from '@/domains/Auction/BidEngine';

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

    const body = await req.json();
    const { amount, currency, isProxyBid, maximumBid } = body;
    idempotencyKey = req.headers.get('Idempotency-Key');

    if (!idempotencyKey) {
      return NextResponse.json({ error: 'Idempotency-Key header required' }, { status: 400 });
    }

    if (idempotencyMap.has(idempotencyKey)) {
      return NextResponse.json(idempotencyMap.get(idempotencyKey), { status: 200 });
    }

    idempotencyMap.set(idempotencyKey, { pending: true });

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
    if (idempotencyKey) idempotencyMap.delete(idempotencyKey);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}
