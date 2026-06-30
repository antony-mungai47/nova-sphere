"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { strictRateLimiter } from "@/lib/rate-limit";

export async function cancelOrder(orderId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!strictRateLimiter.check(`cancel_order_${userId}`)) {
    return { success: false, error: "Too many requests. Try again later." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Find the order
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true, user: true }
      });

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.user.clerkId !== userId) {
        throw new Error("Unauthorized to cancel this order");
      }

      if (order.status === "CANCELLED") {
        throw new Error("Order is already cancelled");
      }

      if (order.status === "SHIPPED" || order.status === "DELIVERED") {
        throw new Error("Cannot cancel an order that has already shipped");
      }

      // Restore inventory
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }

      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" }
      });

      return updatedOrder;
    });

    revalidatePath("/account");
    revalidatePath(`/order/${orderId}`);
    return { success: true, order: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
