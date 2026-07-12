import { inngest } from '@/lib/inngest/client';

export const refundSagaWorkflow = (inngest as any).createFunction(
  { id: 'RefundSaga', name: 'RefundSaga Workflow', retries: 3 },
  { event: 'Refund.v1' },
  async ({ event, step }: any) => {
    const { idempotencyKey } = event.data;
    return { success: true };
  }
);
