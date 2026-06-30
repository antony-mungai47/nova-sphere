import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { auditLogSubscriber } from '@/domains/Audit/jobs';
import { deadLetterQueueHandler } from '@/domains/Audit/dlq';
import { orderPlacedNotification } from '@/domains/Engagement/Notifications/jobs';
import { userActivitySubscriber } from '@/domains/Recommendations/activityJobs';
import { broadcastEngineSubscriber } from '@/domains/CommerceCore/BroadcastEngine/services/jobs';
import { orderSagaWorkflow } from '@/domains/CommerceCore/WorkflowEngine/services/OrderSaga';

// We will import our functions here once they are defined
const functions = [
  auditLogSubscriber,
  deadLetterQueueHandler,
  orderPlacedNotification,
  userActivitySubscriber,
  broadcastEngineSubscriber,
  orderSagaWorkflow,
];

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
