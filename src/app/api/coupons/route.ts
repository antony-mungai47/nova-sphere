import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return new NextResponse("Code is required", { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code." }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "This coupon is no longer active." }, { status: 400 });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: "This coupon has expired." }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      discountPercent: coupon.discountPercent 
    });

  } catch (error) {
    console.error("[COUPON_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
