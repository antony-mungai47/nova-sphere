import { InventoryCommandService } from "../commands/InventoryCommandService";
import { OrderRepository } from "../../infrastructure/repositories/OrderRepository";

export class OrderCancelledSaga {
  /**
   * Handles the order.cancelled domain event out of the outbox relay.
   * Emits an idempotent ReleaseInventoryCommand.
   */
  static async handle(payload: { orderId: string; tenantId: string }) {
    const { orderId, tenantId } = payload;
    
    const order = await OrderRepository.findById(orderId, tenantId);
    if (!order) {
      console.error(`OrderCancelledSaga: Order ${orderId} not found`);
      return;
    }

    // Prepare compensation commands for each item
    const promises = order.items.map(item => {
      // We use the OrderTimeline as the idempotency trace for this compensation
      const compensationIdempotencyKey = `comp-inv-${orderId}-${item.productId}`;
      
      return InventoryCommandService.releaseInventory({
        productId: item.productId,
        quantity: item.quantity,
        orderId: order.id,
        traceId: compensationIdempotencyKey
      }).catch(err => {
        console.error(`Failed to release inventory for product ${item.productId}:`, err);
        throw err;
      });
    });

    await Promise.all(promises);
  }
}
