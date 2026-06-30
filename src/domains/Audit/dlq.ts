import { inngest } from '@/lib/inngest/client';

export const deadLetterQueueHandler = (inngest as any).createFunction(
  { id: 'dead-letter-queue-handler' },
  { event: 'inngest/function.failed' },
  async ({ event, step }: any) => {
    const failedEvent = event.data.event;
    const error = event.data.error;
    const functionId = event.data.function_id;

    await step.run('alert-admin', async () => {
      console.error(`[DLQ ALERT] Function ${functionId} failed permanently.`);
      console.error(`Original Event:`, failedEvent);
      console.error(`Error Message:`, error.message);
      
      // Here we could:
      // 1. Send an email to the ops team
      // 2. Post a message to Slack/Discord
      // 3. Write to a specific DLQ table in the DB for manual retry
    });

    return { dlqProcessed: true };
  }
);
