import { inngest } from '@/lib/inngest/client';

export const payoutSagaWorkflow = (inngest as any).createFunction(
  { id: 'PayoutSaga', name: 'PayoutSaga Workflow', retries: 3 },
  { event: 'Payout.v1' },
  async ({ event, step }: any) => {
    const { idempotencyKey } = event.data;
    return { success: true };
  }
);
