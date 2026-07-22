import { NextResponse } from "next/server";
import { CheckoutService } from "@/modules/commerce/application/CheckoutService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, total } = body;

    const result = await CheckoutService.checkout(items, total);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[CHECKOUT_ERROR]", error);
    if (error.message === "Unauthorized") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (error.message === "Items are required") {
      return new NextResponse("Items are required", { status: 400 });
    }
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
