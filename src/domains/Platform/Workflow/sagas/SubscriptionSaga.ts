import { inngest } from '@/lib/inngest/client';

export const subscriptionSagaWorkflow = (inngest as any).createFunction(
  { id: 'SubscriptionSaga', name: 'SubscriptionSaga Workflow', retries: 3 },
  { event: 'Subscription.v1' },
  async ({ event, step }: any) => {
    const { idempotencyKey } = event.data;
    return { success: true };
  }
);
