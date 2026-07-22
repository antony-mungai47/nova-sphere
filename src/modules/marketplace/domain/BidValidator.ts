import { AuctionStateMachine } from "./AuctionStateMachine";
import { BidIncrementPolicy } from "./BidIncrementPolicy";

export class BidValidator {
  static validate(bidAmount: number, userId: string, auction: any) {
    // Rule 1: Auction must be in a state that accepts bids
    if (!AuctionStateMachine.canAcceptBids(auction.status)) {
      throw new Error("Auction is not open for bidding.");
    }

    // Rule 2: Cannot bid on own auction (Assuming auction has ownerTenantId or similar relation, simplified here)
    if (auction.sellerId === userId) {
      throw new Error("Sellers cannot bid on their own auctions.");
    }

    // Rule 3: Must meet reserve or base amount if no bids yet
    const currentHigh = Number(auction.currentBid || 0);
    const base = Number(auction.baseAmount || 0);
    if (currentHigh === 0 && bidAmount < base) {
      throw new Error(`Initial bid must be at least the base amount of ${base}`);
    }

    // Rule 4: Must meet minimum increment
    if (currentHigh > 0) {
      const minNextBid = BidIncrementPolicy.getMinimumNextBid(currentHigh);
      if (bidAmount < minNextBid) {
        throw new Error(`Bid amount must be at least ${minNextBid}`);
      }
    }
  }
}
