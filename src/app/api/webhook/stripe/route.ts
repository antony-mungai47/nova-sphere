import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PaymentEngine } from "@/domains/Finance/PaymentEngine/PaymentEngine";
import { InvoiceEngine } from "@/domains/Finance/InvoiceEngine/InvoiceEngine";
import { inngest } from "@/lib/inngest/client";

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

  // Webhook Controller: Normalizes events and routes them to the Payment Engine or Event Bus
  const paymentEngine = new PaymentEngine("STRIPE");

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const orderId = session.metadata?.orderId;
        const paymentIntentId = session.payment_intent;
        
        if (orderId) {
          // Instruct Payment Engine to capture the funds and update the Ledger
          await paymentEngine.capture(
            orderId, 
            paymentIntentId, 
            session.amount_total / 100, 
            session.currency.toUpperCase()
          );

          // Generate Invoice
          await InvoiceEngine.generateInvoice(orderId);

          // Emit Accounting Event for Workflow Engine (Order Engine / Shipping)
          await inngest.send({
            name: "payment/captured",
            data: { orderId, paymentIntentId, amount: session.amount_total / 100 }
          });
        }
        break;
      }
      
      case "charge.refunded": {
        const charge = event.data.object as any;
        const paymentIntentId = charge.payment_intent;
        
        await inngest.send({
          name: "payment/refunded",
          data: { paymentIntentId, amount: charge.amount_refunded / 100 }
        });
        break;
      }
    }

    return new NextResponse("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error", error);
    return new NextResponse("Webhook handler error", { status: 500 });
  }
}
