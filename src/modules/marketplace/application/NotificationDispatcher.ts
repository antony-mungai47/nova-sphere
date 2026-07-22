import { OutboxRepository } from "../infrastructure/repositories/OutboxRepository";

export class NotificationDispatcher {
  static async processPendingEvents() {
    const events = await OutboxRepository.getPendingEvents();

    for (const event of events) {
      try {
        switch (event.eventType) {
          case "BidPlaced":
            await this.handleBidPlaced(event.payload);
            break;
          case "Outbid":
            await this.handleOutbid(event.payload);
            break;
          case "AuctionWon":
            await this.handleAuctionWon(event.payload);
            break;
          case "OrderCreationRequested":
            await this.handleOrderCreationRequested(event.payload);
            break;
          default:
            console.log(`Unhandled event type: ${event.eventType}`);
        }
        await OutboxRepository.markProcessed(event.id);
      } catch (error: any) {
        await OutboxRepository.markFailed(event.id, error.message);
      }
    }
  }

  private static async handleBidPlaced(payload: any) {
    // Adapter integration (e.g. Pusher to broadcast to clients viewing the auction)
    console.log(`[Pusher Mock] Broadcasting new bid on auction ${payload.auctionId} for ${payload.amount}`);
  }

  private static async handleOutbid(payload: any) {
    // Adapter integration (e.g. SendGrid to email previous highest bidder)
    console.log(`[Email Mock] Sending Outbid email to user ${payload.userId} for auction ${payload.auctionId}`);
  }

  private static async handleAuctionWon(payload: any) {
    // Adapter integration (e.g. SendGrid to email winner)
    console.log(`[Email Mock] Sending Winner email to user ${payload.winnerId} for auction ${payload.auctionId}`);
  }

  private static async handleOrderCreationRequested(payload: any) {
    // Adapter integration (Cross-domain request to Commerce Checkout)
    console.log(`[Commerce Mock] Requesting order creation for user ${payload.userId} for amount ${payload.amount}`);
  }
}
