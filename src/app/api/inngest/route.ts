import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';


import { scheduledReconciliation, scheduledCartCleanup, processAuctionStarted, processAuctionEnded, processAuctionOutbid } from '@/lib/inngest/functions';

const functions: any[] = [scheduledReconciliation, scheduledCartCleanup, processAuctionStarted, processAuctionEnded, processAuctionOutbid];

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});

