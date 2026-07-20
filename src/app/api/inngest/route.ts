import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { auditLogSubscriber } from '@/domains/Audit/jobs';
import { deadLetterQueueHandler } from '@/domains/Audit/dlq';
import { orderPlacedNotification } from '@/domains/Engagement/Notifications/jobs';
import { userActivitySubscriber } from '@/domains/Recommendations/activityJobs';
import { broadcastEngineSubscriber } from '@/domains/CommerceCore/BroadcastEngine/services/jobs';
import { orderSagaWorkflow } from '@/domains/Platform/Workflow/sagas/OrderSaga';
import { refundSagaWorkflow } from '@/domains/Platform/Workflow/sagas/RefundSaga';
import { auctionCloseSagaWorkflow } from '@/domains/Platform/Workflow/sagas/AuctionCloseSaga';
import { returnSagaWorkflow } from '@/domains/Platform/Workflow/sagas/ReturnSaga';
import { payoutSagaWorkflow } from '@/domains/Platform/Workflow/sagas/PayoutSaga';
import { subscriptionSagaWorkflow } from '@/domains/Platform/Workflow/sagas/SubscriptionSaga';
import { vendorApprovalSaga } from '@/domains/Platform/Workflow/sagas/VendorApprovalSaga';

import { scheduledReconciliation, scheduledCartCleanup, processAuctionStarted, processAuctionEnded, processAuctionOutbid } from '@/lib/inngest/functions';

const functions: any[] = [scheduledReconciliation, scheduledCartCleanup, processAuctionStarted, processAuctionEnded, processAuctionOutbid];

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});

