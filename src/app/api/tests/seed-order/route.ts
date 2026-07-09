import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This endpoint is STRICTLY for load testing and E2E automation
export async function POST(req: Request) {
  try {
    const timestamp = Date.now();
    const userId = `k6-user-${timestamp}`;
    const orderId = `k6-order-${timestamp}`;
    const productId = `k6-product-${timestamp}`;

    // Create a mock user
    await prisma.user.create({
      data: {
        id: userId,
        clerkId: `clerk-k6-${timestamp}`,
        email: `k6-${timestamp}@example.com`,
        name: 'K6 Load Tester',
      }
    });

    // Create a mock product
    await prisma.product.create({
      data: {
        id: productId,
        name: 'K6 Load Test Item',
        description: 'For Load Testing',
        price: 100,
        sku: `SKU-K6-${timestamp}`,
        category: 'TEST',
        brand: 'TEST BRAND',
        status: 'ACTIVE'
      }
    });

    // Create an order
    await prisma.order.create({
      data: {
        id: orderId,
        userId: userId,
        status: 'PENDING',
        subtotal: 100,
        tax: 0,
        shippingCost: 0,
        totalAmount: 100,
        currency: 'USD',
        items: {
          create: [{
            productId: productId,
            quantity: 1,
            price: 100
          }]
        }
      }
    });

    return NextResponse.json({ success: true, orderId, userId, productId });
  } catch (error: any) {
    console.error("[K6_SEED_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
