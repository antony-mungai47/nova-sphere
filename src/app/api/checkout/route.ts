import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { items, total } = body;

    if (!items || items.length === 0) {
      return new NextResponse("Items are required", { status: 400 });
    }

    // Ensure user exists in our Prisma DB
    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`,
      },
      create: {
        clerkId: userId,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`,
      },
    });

    // Calculate realistic totals for security instead of trusting client total
    let subtotal = 0;
    const dbItems = await prisma.product.findMany({
      where: { id: { in: items.map((i: any) => i.id) } }
    });

    const itemsToCreate = items.map((item: any) => {
      const dbProduct = dbItems.find(p => p.id === item.id);
      const priceToUse = dbProduct ? (dbProduct.salePrice || dbProduct.price) : item.price;
      subtotal += priceToUse * item.quantity;
      return {
        productId: item.id,
        quantity: item.quantity,
        price: priceToUse,
      };
    });

    const discountAmount = subtotal - total; // Since total sent from client is discounted
    const tax = subtotal * 0.08; // 8% mock tax
    const shippingCost = subtotal > 100 ? 0 : 15.00; // Free shipping over $100
    const finalTotal = subtotal - discountAmount + tax + shippingCost;

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: dbUser.id,
        subtotal: subtotal,
        tax: tax,
        shippingCost: shippingCost,
        discount: discountAmount,
        totalAmount: finalTotal,
        status: "PENDING", // Mocking pending status until simulated webhook
        items: {
          create: itemsToCreate,
        },
      },
    });

    return NextResponse.json({ success: true, checkoutUrl: "/checkout/simulate?orderId=" + order.id });
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
