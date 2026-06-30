import { inngest } from '@/lib/inngest/client';
import { prisma } from '@/lib/prisma';

export const auditLogSubscriber = (inngest as any).createFunction(
  { id: 'audit-log-subscriber' },
  // Listen to multiple events or use a wildcard if needed,
  // For now we listen specifically to critical events
  [{ event: 'OrderCreated' }, { event: 'UserCreated' }, { event: 'BidPlaced' }, { event: 'UserActivityLogged' }],
  async ({ event, step }: any) => {
    // Write immutable log to the database
    await step.run('write-audit-log', async () => {
      await prisma.auditLog.create({
        data: {
          action: event.name,
          resource: 'resourceId' in event.data ? (event.data.resourceId as string) : ('orderId' in event.data ? (event.data.orderId as string) : ('userId' in event.data ? (event.data.userId as string) : undefined)),
          userId: 'userId' in event.data ? (event.data.userId as string) : undefined,
          metadata: event.data,
        },
      });
    });

    return { success: true, loggedAction: event.name };
  }
);
