import { NextResponse } from "next/server";
import { sendOrderConfirmation } from "@/lib/email";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const orderId = formData.get("orderId") as string;

    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 });
    }

    // Update order status to PAID
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
      include: { user: true }
    });

    // Simulate sending an email receipt
    if (order.user.email) {
      await sendOrderConfirmation(order.user.email, order.id, order.totalAmount);
    }

    // Redirect user to the success page using 303 See Other
    return NextResponse.redirect(new URL("/checkout/success", req.url), 303);

  } catch (error) {
    console.error("[SIMULATE_WEBHOOK_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
