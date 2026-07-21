import { prisma } from "@/lib/prisma";

export async function getInfrastructureStatus() {
  const start = Date.now();
  let dbStatus = "healthy";
  let dbResponseTime = 0;
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbResponseTime = Date.now() - start;
  } catch (e) {
    dbStatus = "unhealthy";
  }

  return { dbStatus, dbResponseTime };
}

export async function getBusinessMetrics() {
  try {
    // Basic aggregation
    const ordersToday = await prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    const revenueResult = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        status: "CAPTURED",
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 1)) // Active in last 24h
        }
      }
    });

    const activeAuctions = await prisma.auction.count({
      where: {
        status: "LIVE"
      }
    });

    return {
      orders: ordersToday,
      revenue: revenueResult._sum.totalAmount?.toNumber().toFixed(2) || "0.00",
      activeUsers,
      activeAuctions
    };
  } catch (error) {
    console.error("Failed to fetch business metrics", error);
    return {
      orders: 0,
      revenue: "0.00",
      activeUsers: 0,
      activeAuctions: 0
    };
  }
}
