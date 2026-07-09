import { NextResponse } from "next/server";
import { PaymentEngine } from "@/domains/CommerceCore/PaymentEngine/services/PaymentEngine";
import { PrismaPaymentRepository } from "@/domains/CommerceCore/PaymentEngine/repositories/PrismaPaymentRepository";
import { MockPaymentProvider } from "@/domains/CommerceCore/PaymentEngine/providers/MockPaymentProvider";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/lib/inngest/client";
import { InvoiceEngine } from "@/domains/Finance/InvoiceEngine/InvoiceEngine";

export async function POST(req: Request) {
  try {
    // Determine if it's form data (from UI) or JSON (from API test)
    const contentType = req.headers.get("content-type") || "";
    let orderId = "";
    let scenario = "success";
    let amount = 0;
    let providerEventId = "";
    
    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      orderId = formData.get("orderId") as string;
      scenario = (formData.get("scenario") as string) || "success";
      providerEventId = (formData.get("providerEventId") as string) || `evt_mock_${Date.now()}`;
    } else {
      const body = await req.json();
      orderId = body.orderId;
      scenario = body.scenario || "success";
      providerEventId = body.providerEventId || `evt_mock_${Date.now()}`;
    }

    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 });
    }

    // Get order amount for the fake event
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    if (order) amount = order.totalAmount.toNumber();

    const payloadObj = {
      scenario,
      orderId,
      amount,
      currency: 'USD',
      providerEventId
    };

    const payloadStr = JSON.stringify(payloadObj);
    const signature = "mock_signature";

    const repo = new PrismaPaymentRepository(prisma);
    const provider = new MockPaymentProvider();
    const paymentEngine = new PaymentEngine(repo, provider);

    if (scenario === 'database_deadlock') {
      return new NextResponse("Simulated DB Deadlock", { status: 503 });
    }

    // Process the webhook
    const processed = await paymentEngine.processWebhook(payloadStr, signature);

    if (scenario === 'success' && processed) {
      // In a real webhook, this is where we trigger downstream events
      // We will emulate the Stripe webhook behavior of emitting to Inngest
      await InvoiceEngine.generateInvoice(orderId);
      
      try {
        await inngest.send({
          name: "payment/captured",
          data: { 
            orderId, 
            paymentIntentId: providerEventId, 
            amount 
          }
        });
      } catch (e: any) {
        console.warn("[SIMULATE_WEBHOOK_WARNING] Inngest send failed (likely missing INNGEST_EVENT_KEY). Skipping.", e.message);
      }
    }

    // For browser UI tests submitting forms, redirect to success
    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      return NextResponse.redirect(new URL("/checkout/success", req.url), 303);
    }

    // For API tests, return JSON
    return NextResponse.json({ success: true, processed: true });

  } catch (error: any) {
    console.error("[SIMULATE_WEBHOOK_ERROR]", error);
    if (error.message === 'Simulated Stripe Timeout') {
      return new NextResponse("Gateway Timeout", { status: 504 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
