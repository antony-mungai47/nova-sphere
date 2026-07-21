import { inngest } from '../../lib/inngest/client';
import { prisma } from '../../lib/prisma';

export const nightlyReconciliation = (inngest as any).createFunction(
  { id: 'nightly-reconciliation' },
  { cron: '0 0 * * *' }, // Run at midnight every day
  async ({ step }: any) => {
    
    // 1. Reconcile Order Totals for the Day
    await step.run('reconcile-daily-metrics', async () => {
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      yesterday.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(yesterday);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const orders = await prisma.order.aggregate({
        where: {
          createdAt: { gte: yesterday, lte: endOfDay },
          status: { in: ['CAPTURED', 'DELIVERED'] }
        },
        _sum: { totalAmount: true },
        _count: { id: true }
      });

      await prisma.dailyMetrics.upsert({
        where: { date: yesterday },
        update: {
          revenue: orders._sum.totalAmount || 0,
          orders: orders._count.id || 0
        },
        create: {
          date: yesterday,
          revenue: orders._sum.totalAmount || 0,
          orders: orders._count.id || 0,
          visitors: 0,
          pageviews: 0
        }
      });
    });

    // We can add similar reconciliation steps for VendorMetrics, AuctionMetrics, etc.
    return { success: true };
  }
);
