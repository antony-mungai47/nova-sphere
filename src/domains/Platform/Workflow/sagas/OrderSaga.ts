import { inngest } from '@/lib/inngest/client';

export const orderSagaWorkflow = (inngest as any).createFunction(
  { 
    id: 'OrderSaga',
    name: 'Order Fulfillment Saga',
    retries: 3 
  },
  { event: 'OrderPlaced.v1' },
  async ({ event, step }: any) => {
    const { orderId, userId, idempotencyKey } = event.data;

    try {
      // Step 1: Validate Idempotency & Initialization
      await step.run('initialize-saga', async () => {
        console.log(`[OrderSaga] Initializing Order ${orderId} (Key: ${idempotencyKey})`);
      });

      // Step 2: Reserve Inventory
      const reservation = await step.run('reserve-inventory', async () => {
        return { success: true, reservationId: `RES-${orderId}` };
      });

      if (!reservation.success) throw new Error('InventoryReservationFailed');

      // Step 3: Wait for Payment
      const payment = await step.run('process-payment', async () => {
        // Wait for external webhook or process synchronously
        return { success: true };
      });

      if (!payment.success) throw new Error('PaymentFailed');

      // Step 4: Confirm Inventory
      await step.run('confirm-inventory', async () => {
        console.log(`[OrderSaga] Confirmed inventory for ${reservation.reservationId}.`);
      });

      // Step 5: Publish Completion Event
      await step.run('publish-completion', async () => {
        await inngest.send({
          name: 'OrderCompleted.v1',
          data: { orderId, userId }
        });
      });

      return { success: true, status: 'COMPLETED' };
      
    } catch (error: any) {
      console.error(`[OrderSaga] Failed for Order ${orderId}. Compensating.`, error.message);

      // COMPENSATION: Release Inventory if it was reserved
      if (['PaymentFailed', 'PaymentTimeout'].includes(error.message)) {
        await step.run('compensate-release-inventory', async () => {
          console.log(`[Compensation] Releasing inventory for Order ${orderId}.`);
        });
      }

      await step.run('publish-failure', async () => {
        await inngest.send({
          name: 'OrderCancelled.v1',
          data: { orderId, reason: error.message }
        });
      });

      throw error;
    }
  }
);
