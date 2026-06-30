import { inngest } from '@/lib/inngest/client';
import { RealtimeFactory } from '@/domains/Realtime/providers/RealtimeFactory';
import { isFeatureEnabled } from '@/lib/featureFlags';

const realtimeProvider = RealtimeFactory.getInstance();

export const broadcastEngineSubscriber = (inngest as any).createFunction(
  { id: 'broadcast-engine-subscriber' },
  // Listen to events that need real-time propagation
  [{ event: 'BidPlaced' }, { event: 'InventoryReserved' }],
  async ({ event, step }: any) => {
    // Determine the channel based on the event
    let channel = '';
    let eventName = event.name;

    switch (event.name) {
      case 'BidPlaced':
        channel = `public-auction-${(event.data as any).auctionId}`;
        break;
      case 'InventoryReserved':
        // We broadcast to the product page so users know stock is depleting live
        channel = `public-product-${(event.data as any).productId}`;
        break;
      default:
        channel = 'public-global';
    }

    // Step: Broadcast via Real-time Provider
    await step.run('broadcast-to-websockets', async () => {
      // In a real app, wrap in a feature flag check if needed
      await realtimeProvider.publish(channel, eventName, event.data);
    });

    return { broadcasted: true, channel };
  }
);
