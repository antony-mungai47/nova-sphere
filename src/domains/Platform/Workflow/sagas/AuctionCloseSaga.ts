import { inngest } from '@/lib/inngest/client';

export const auctionCloseSagaWorkflow = (inngest as any).createFunction(
  { id: 'AuctionCloseSaga', name: 'AuctionCloseSaga Workflow', retries: 3 },
  { event: 'AuctionClose.v1' },
  async ({ event, step }: any) => {
    const { idempotencyKey } = event.data;
    // TODO: Implement Saga
    return { success: true };
  }
);
