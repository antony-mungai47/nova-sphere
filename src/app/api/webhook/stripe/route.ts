import { OrderRepository } from "@/domains/Customer/orders/repositories/order.repository";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  if (!stripe) {
    return new NextResponse("Stripe not configured", { status: 400 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const orderId = session.metadata?.orderId;
        const paymentIntentId = session.payment_intent;
        
        if (orderId) {
          await OrderRepository.update({
            where: { id: orderId },
            data: { 
              status: "PAID",
              stripePaymentIntentId: paymentIntentId as string
            },
          });

          await prisma.transaction.create({
            data: {
              orderId,
              type: "CHARGE",
              amount: session.amount_total / 100,
              currency: session.currency.toUpperCase(),
              stripeId: paymentIntentId as string,
              status: "SUCCEEDED"
            }
          });
        }
        break;
      }
      
      case "charge.refunded": {
        const charge = event.data.object as any;
        const paymentIntentId = charge.payment_intent;
        
        const order = await OrderRepository.findUnique({
          where: { stripePaymentIntentId: paymentIntentId as string }
        });

        if (order) {
          await OrderRepository.update({
            where: { id: order.id },
            data: { status: "REFUNDED" }
          });

          await prisma.transaction.create({
            data: {
              orderId: order.id,
              type: "REFUND",
              amount: charge.amount_refunded / 100,
              currency: charge.currency.toUpperCase(),
              stripeId: charge.id,
              status: "SUCCEEDED"
            }
          });
        }
        break;
      }
    }

    return new NextResponse("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error", error);
    return new NextResponse("Webhook handler error", { status: 500 });
  }
}
