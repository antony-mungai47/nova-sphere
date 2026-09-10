import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getRateLimiter } from '@/lib/security/RateLimiterFactory';
import { prisma } from '@/lib/prisma';

const rateLimiter = getRateLimiter();
const MAX_PAYLOAD_SIZE = 2 * 1024 * 1024; // 2MB Limit
const BASE_LISTING_FEE = 5.00; // $5 base fee per product

export async function POST(req: Request) {
  try {
    const contentLength = Number(req.headers.get('content-length') || '0');
    if (contentLength > MAX_PAYLOAD_SIZE) return NextResponse.json({ error: 'Payload too large' }, { status: 413 });

    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const isAllowed = await rateLimiter.checkLimit(`vendor_checkout_${userId || ip}`, 10, 60);
    if (!isAllowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json();
    const { products, subscriptionTier } = body;

    const tenantUser = await prisma.tenantUser.findFirst({
      where: { userId },
      include: { tenant: true }
    });

    if (!tenantUser) {
      return NextResponse.json({ error: 'Vendor profile not found.' }, { status: 403 });
    }

    let totalFee = 0;
    
    // 1. Calculate Listing Fees
    if (products && Array.isArray(products) && products.length > 0) {
      totalFee += products.length * BASE_LISTING_FEE;
    }

    // 2. Calculate Subscription Fees
    if (subscriptionTier) {
      const tierPrices: Record<string, number> = {
        '1_WEEK': 10,
        '1_MONTH': 35,
        '3_MONTHS': 90,
        '6_MONTHS': 160,
        '1_YEAR': 300
      };
      if (tierPrices[subscriptionTier]) {
        totalFee += tierPrices[subscriptionTier];
      }
    }

    if (totalFee === 0) {
      return NextResponse.json({ error: 'No fees calculated.' }, { status: 400 });
    }

    // Simulate Payment Success and grant subscription
    if (subscriptionTier) {
      const tierDays: Record<string, number> = {
        '1_WEEK': 7,
        '1_MONTH': 30,
        '3_MONTHS': 90,
        '6_MONTHS': 180,
        '1_YEAR': 365
      };
      const days = tierDays[subscriptionTier];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      await prisma.vendorSubscription.create({
        data: {
          tenantId: tenantUser.tenantId,
          tier: subscriptionTier,
          endDate: endDate
        }
      });
    }

    if (products && products.length > 0) {
      await prisma.product.createMany({
        data: products.map((p: any) => ({
          name: p.name,
          description: p.description || '',
          price: p.price,
          category: p.category || 'General',
          ownerTenantId: tenantUser.tenantId,
          status: 'DRAFT',
          createdBy: userId
        }))
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payment simulated and resources provisioned.',
      totalPaid: totalFee
    });
  } catch (error: any) {
    console.error('[VENDOR_CHECKOUT_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
