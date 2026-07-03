import { inngest } from '@/lib/inngest/client';
import { prisma } from '@/lib/prisma';

export const auditLogSubscriber = (inngest as any).createFunction(
  { id: 'audit-log-subscriber' },
  // Frozen Event Contracts (v1)
  [
    { event: 'OrderCreated.v1' }, 
    { event: 'UserCreated.v1' }, 
    { event: 'BidPlaced.v1' }, 
    { event: 'UserActivityLogged.v1' }
  ],
  async ({ event, step }: any) => {
    // Write immutable log to the database
    await step.run('write-audit-log', async () => {
      const resourceId = 'resourceId' in event.data ? (event.data.resourceId as string) : ('orderId' in event.data ? (event.data.orderId as string) : ('userId' in event.data ? (event.data.userId as string) : 'unknown'));
      
      await prisma.auditLog.create({
        data: {
          action: event.name,
          resourceType: event.name,
          resourceId: resourceId,
          userId: 'userId' in event.data ? (event.data.userId as string) : undefined,
          newValue: event.data,
        },
      });
    });

    return { success: true, loggedAction: event.name };
  }
);
