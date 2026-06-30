import { inngest } from '@/lib/inngest/client';

export const orderPlacedNotification = (inngest as any).createFunction(
  { id: 'send-order-placed-notification' },
  { event: 'OrderCreated' },
  async ({ event, step }: any) => {
    const { orderId, userId, totalAmount } = event.data;

    // Simulate sending email
    await step.run('send-email', async () => {
      // In a real implementation, this would call Resend/SendGrid
      console.log(`[Notification] Sending Order Confirmation Email to User ${userId} for Order ${orderId}. Total: $${totalAmount}`);
      // await resend.emails.send({...})
    });

    // Simulate push notification
    await step.run('send-push', async () => {
      console.log(`[Notification] Pushing app notification for Order ${orderId}`);
    });

    return { success: true };
  }
);
