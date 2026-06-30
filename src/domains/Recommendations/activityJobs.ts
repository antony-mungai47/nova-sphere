import { inngest } from '@/lib/inngest/client';
import { prisma } from '@/lib/prisma';

export const userActivitySubscriber = (inngest as any).createFunction(
  { id: 'user-activity-subscriber' },
  { event: 'UserActivityLogged' },
  async ({ event, step }: any) => {
    const { userId, sessionId, activityType, resourceId, metadata } = event.data;

    await step.run('write-user-activity', async () => {
      await prisma.userActivity.create({
        data: {
          userId,
          sessionId,
          activityType,
          resourceId,
          metadata: metadata || {},
        },
      });
    });

    return { success: true };
  }
);
