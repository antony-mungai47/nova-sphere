import { inngest } from '@/lib/inngest/client';
import { NotificationService } from './NotificationService';
import { NotificationType, NotificationPriority } from '@prisma/client';

export const orderPlacedNotification = (inngest as any).createFunction(
  { id: 'send-order-placed-notification' },
  { event: 'OrderCreated' },
  async ({ event, step }: any) => {
    const { orderId, userId, totalAmount } = event.data;

    await step.run('create-notification', async () => {
      await NotificationService.createNotification({
        userId,
        type: NotificationType.ORDER_UPDATED,
        priority: NotificationPriority.HIGH,
        title: "Order Confirmed",
        message: `Your order for $${totalAmount.toFixed(2)} has been confirmed!`,
        link: `/account/orders/${orderId}`,
        metadata: { orderId }
      });
    });

    return { success: true };
  }
);

export const bidOutbidNotification = (inngest as any).createFunction(
  { id: 'send-bid-outbid-notification' },
  { event: 'BidOutbid' },
  async ({ event, step }: any) => {
    const { auctionId, previousBidderId, newHighestBid } = event.data;

    await step.run('create-outbid-notification', async () => {
      await NotificationService.createNotification({
        userId: previousBidderId,
        type: NotificationType.BID_OUTBID,
        priority: NotificationPriority.CRITICAL,
        title: "You've been outbid!",
        message: `Someone just placed a higher bid of $${newHighestBid.toFixed(2)}.`,
        link: `/auctions/${auctionId}`,
        metadata: { auctionId, newHighestBid }
      });
    });

    return { success: true };
  }
);
