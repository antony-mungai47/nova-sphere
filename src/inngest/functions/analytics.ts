import { inngest } from '../../lib/inngest/client';
import { prisma } from '../../lib/prisma';
import { PostHog } from 'posthog-node';

const client = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY || 'mock-key',
  { host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com' }
);

export const processAnalyticsEvent = (inngest as any).createFunction(
  { id: 'process-analytics-event', retries: 3 },
  { event: 'analytics/event.received' },
  async ({ event, step }: any) => {
    const { eventId } = event.data;

    const outboxEvent = await step.run('fetch-outbox-event', async () => {
      return prisma.analyticsEvent.findUnique({ where: { eventId } });
    });

    if (!outboxEvent || outboxEvent.status !== 'PENDING') {
      return { status: 'skipped' };
    }

    // 1. Fan-out to PostHog
    await step.run('push-to-posthog', async () => {
      client.capture({
        distinctId: outboxEvent.userId || outboxEvent.sessionId || 'anonymous',
        event: outboxEvent.eventName,
        properties: {
          ...((outboxEvent.metadata as any) || {}),
          tenantId: outboxEvent.tenantId,
          vendorId: outboxEvent.vendorId,
          device: outboxEvent.device,
          country: outboxEvent.country,
          currency: outboxEvent.currency,
          source: outboxEvent.source,
          server_timestamp: outboxEvent.occurredAt
        }
      });
      await client.flush();
    });

    // 2. Near-Real-Time Rollup (simplified example for DailyMetrics)
    await step.run('update-daily-metrics', async () => {
      if (outboxEvent.eventName === 'commerce.checkout.completed') {
        const metadata = outboxEvent.metadata as any;
        const revenue = metadata?.totalAmount || 0;
        
        const today = new Date(outboxEvent.occurredAt);
        today.setUTCHours(0, 0, 0, 0);

        await prisma.dailyMetrics.upsert({
          where: { date: today },
          update: {
            orders: { increment: 1 },
            revenue: { increment: revenue }
          },
          create: {
            date: today,
            orders: 1,
            revenue: revenue,
            visitors: 0,
            pageviews: 0
          }
        });
      }
    });

    // 3. Mark Processed
    await step.run('mark-processed', async () => {
      await prisma.analyticsEvent.update({
        where: { eventId },
        data: {
          status: 'PROCESSED',
          processedAt: new Date()
        }
      });
    });

    return { status: 'processed', eventId };
  }
);
