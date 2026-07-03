import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { PaymentEngine } from "@/domains/Finance/PaymentEngine/PaymentEngine";

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

    let subtotal = 0;
    const dbItems = await prisma.product.findMany({
      where: { id: { in: items.map((i: any) => i.id) } }
    });

    const itemsToCreate = items.map((item: any) => {
      const dbProduct = dbItems.find(p => p.id === item.id);
      const priceToUse = dbProduct ? (dbProduct.salePrice || dbProduct.price) : item.price;
      subtotal += Number(priceToUse) * item.quantity;
      return {
        productId: item.id,
        quantity: item.quantity,
        price: priceToUse,
      };
    });

    // In a real system, TaxEngine and PricingEngine would run here.
    const discountAmount = subtotal - total; 
    const tax = subtotal * 0.08; 
    const shippingCost = subtotal > 100 ? 0 : 15.00; 
    const finalTotal = subtotal - discountAmount + tax + shippingCost;

    const order = await prisma.order.create({
      data: {
        userId: dbUser.id,
        subtotal: subtotal,
        tax: tax,
        shippingCost: shippingCost,
        discount: discountAmount,
        totalAmount: finalTotal,
        status: "CREATED", // Starts as CREATED before PaymentEngine
        currency: "USD",
        items: {
          create: itemsToCreate,
        },
      },
    });

    // Route through Payment Engine
    const paymentEngine = new PaymentEngine("STRIPE");
    const { checkoutUrl } = await paymentEngine.authorize(
      order.id, 
      `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`, 
      `${process.env.NEXT_PUBLIC_APP_URL}/cart`
    );

    return NextResponse.json({ success: true, checkoutUrl });
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
