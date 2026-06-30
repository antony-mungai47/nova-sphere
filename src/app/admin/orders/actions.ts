"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";

export async function updateOrderStatus(orderId: string, status: string) {
  const authorized = await isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as any }
  });

  revalidatePath("/admin/orders");
}

export async function processRefund(orderId: string) {
  const authorized = await isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  // In a real app, you would call Stripe/payment provider API here
  
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "REFUNDED" }
  });

  revalidatePath("/admin/orders");
}
