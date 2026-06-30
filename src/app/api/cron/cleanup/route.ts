import { OrderRepository } from "@/domains/Customer/orders/repositories/order.repository";
import { SystemLogRepository } from "@/domains/Foundation/database/repositories/systemLog.repository";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  // Verify cron authorization (Vercel cron sends a specific header, or we can use a CRON_SECRET)
  // For local testing, we can allow it or check a secret.
  const authHeader = request.headers.get("authorization");
  
  // In production with Vercel Cron, you'd check process.env.CRON_SECRET
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    await logger.warn("CRON", "Unauthorized cron invocation attempt", { headers: request.headers });
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Delete SystemLogs older than 30 days
    const deletedLogs = await SystemLogRepository.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    // 2. Delete abandoned simulated/pending orders older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const deletedOrders = await OrderRepository.deleteMany({
      where: {
        status: "PENDING",
        createdAt: {
          lt: sevenDaysAgo,
        },
      },
    });

    await logger.info("CRON", "Automated cleanup executed successfully", {
      deletedLogs: deletedLogs.count,
      deletedPendingOrders: deletedOrders.count,
    });

    return NextResponse.json({
      success: true,
      deletedLogs: deletedLogs.count,
      deletedPendingOrders: deletedOrders.count,
    });
  } catch (error: any) {
    await logger.error("CRON", "Failed to execute automated cleanup", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
