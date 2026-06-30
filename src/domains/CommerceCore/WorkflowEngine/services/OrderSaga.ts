import { inngest } from '@/lib/inngest/client';

export const orderSagaWorkflow = (inngest as any).createFunction(
  { id: 'order-saga-workflow', retries: 3 },
  { event: 'OrderCreated' },
  async ({ event, step }: any) => {
    const { orderId, userId, totalAmount } = event.data;

    try {
      // Step 1: Reserve Inventory
      const reservation = await step.run('reserve-inventory', async () => {
        console.log(`[OrderSaga] Reserving inventory for Order ${orderId}`);
        // await InventoryEngine.reserve(...)
        return { success: true, reservationId: 'RES-123' };
      });

      if (!reservation.success) {
        throw new Error('InventoryReservationFailed');
      }

      // Step 2: Calculate Pricing
      const pricing = await step.run('calculate-pricing', async () => {
        console.log(`[OrderSaga] Calculating dynamic pricing for Order ${orderId}`);
        // await PricingEngine.calculate(...)
        return { finalAmount: totalAmount }; 
      });

      // Step 3: Wait for Payment
      // In a real system, we might use step.waitForEvent('PaymentSucceeded', { match: 'orderId', timeout: '15m' })
      const payment = await step.run('process-payment', async () => {
        console.log(`[OrderSaga] Initiating Payment Intent for ${pricing.finalAmount}`);
        // await PaymentEngine.process(...)
        return { success: true };
      });

      if (!payment.success) {
        throw new Error('PaymentFailed');
      }

      // Step 4: Confirm Inventory Decrement
      await step.run('confirm-inventory', async () => {
        console.log(`[OrderSaga] Converting reservation ${reservation.reservationId} to confirmed decrement.`);
      });

      // Step 5: Notify & Ship
      await step.sendEvent('saga-completed', {
        name: 'OrderCompleted',
        data: { orderId, userId }
      });

      return { success: true, status: 'ORDER_COMPLETED' };
      
    } catch (error: any) {
      console.error(`[OrderSaga] Saga failed for Order ${orderId}. Initiating Compensations.`, error.message);

      // COMPENSATION: Release Inventory if it was reserved
      if (error.message === 'PaymentFailed' || error.message === 'PaymentTimeout') {
        await step.run('compensate-release-inventory', async () => {
          console.log(`[Compensation] Releasing inventory for Order ${orderId} due to payment failure.`);
          // await ReservationEngine.release(...)
        });
      }

      // Record Saga failure
      await step.sendEvent('saga-failed', {
        name: 'OrderCancelled',
        data: { orderId, reason: error.message }
      });

      throw error; // Let Inngest handle DLQ if necessary
    }
  }
);
