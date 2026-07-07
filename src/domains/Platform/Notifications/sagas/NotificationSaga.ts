import { DomainEvents as eventBus } from '@/domains/Foundation/events/event-bus';
import { NotificationQueue, NotificationCommand } from '../queue/NotificationQueue';
import { NotificationType, NotificationPriority } from '@prisma/client';

export class NotificationSaga {
  static initialize() {
    eventBus.subscribe('OrderCreated', this.handleOrderCreated);
    eventBus.subscribe('PaymentCaptured', this.handlePaymentCaptured);
    eventBus.subscribe('VendorOrdersCreated', this.handleVendorOrdersCreated);
  }

  private static async handleOrderCreated(payload: any) {
    const { orderId, userId } = payload;
    
    const command: NotificationCommand = {
      userId,
      type: NotificationType.ORDER_UPDATED,
      priority: NotificationPriority.HIGH,
      templateId: 'ORDER_CREATED',
      data: { orderId },
      metadata: { orderId }
    };

    await NotificationQueue.enqueue(command);
  }

  private static async handlePaymentCaptured(payload: any) {
    const { orderId, userId, amount, currency } = payload;
    
    const command: NotificationCommand = {
      userId,
      type: NotificationType.ORDER_UPDATED,
      priority: NotificationPriority.HIGH,
      templateId: 'PAYMENT_CAPTURED',
      data: { orderId, amount, currency },
      metadata: { orderId }
    };

    await NotificationQueue.enqueue(command);
  }

  private static async handleVendorOrdersCreated(payload: any) {
    const { vendorOrders } = payload;
    
    for (const vo of vendorOrders) {
      // Find the tenant owner's user ID (or assume NotificationQueue can resolve tenantId to users)
      // For now, we will pass tenantId in metadata and resolve in the queue/template step
      const command: NotificationCommand = {
        userId: `tenant-${vo.tenantId}`, // Pseudo ID, should be resolved to real users
        type: NotificationType.ORDER_UPDATED,
        priority: NotificationPriority.HIGH,
        templateId: 'VENDOR_ORDER_RECEIVED',
        data: { vendorOrderId: vo.id, amount: vo.subtotal },
        metadata: { vendorOrderId: vo.id, tenantId: vo.tenantId }
      };

      await NotificationQueue.enqueue(command);
    }
  }
}
