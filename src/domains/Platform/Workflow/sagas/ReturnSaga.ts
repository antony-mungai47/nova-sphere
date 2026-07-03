import { inngest } from '@/lib/inngest/client';

export const returnSagaWorkflow = (inngest as any).createFunction(
  { id: 'ReturnSaga', name: 'ReturnSaga Workflow', retries: 3 },
  { event: 'Return.v1' },
  async ({ event, step }: any) => {
    const { idempotencyKey } = event.data;
    // TODO: Implement Saga
    return { success: true };
  }
);
