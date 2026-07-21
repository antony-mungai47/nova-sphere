import { prisma } from "@/lib/prisma";
import { IOperationsProvider } from "./types";

export interface DatabaseMetrics {
  ordersToday: number;
  revenueToday: string;
  activeUsers: number;
  activeAuctions: number;
  migrationVersion: string;
}

export async function getDatabaseProvider(): Promise<IOperationsProvider<DatabaseMetrics>> {
  const start = Date.now();
  let state: "CONNECTED" | "UNAVAILABLE" = "CONNECTED";
  let latencyMs: number | null = null;
  let data: DatabaseMetrics | null = null;

  try {
    // Ping DB for latency
    await prisma.$queryRaw`SELECT 1`;
    latencyMs = Date.now() - start;

    // Fetch metrics
    const ordersToday = await prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    const revenueResult = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: "CAPTURED",
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    });

    const activeUsers = await prisma.user.count({
      where: { updatedAt: { gte: new Date(new Date().setDate(new Date().getDate() - 1)) } }
    });

    const activeAuctions = await prisma.auction.count({
      where: { status: "LIVE" }
    });

    data = {
      ordersToday,
      revenueToday: revenueResult._sum.totalAmount?.toNumber().toFixed(2) || "0.00",
      activeUsers,
      activeAuctions,
      migrationVersion: "v12" // Ideally fetched from prisma migrations table
    };

  } catch (e) {
    state = "UNAVAILABLE";
  }

  return {
    state,
    lastChecked: new Date(),
    latencyMs,
    source: "Prisma (Neon)",
    data
  };
}
