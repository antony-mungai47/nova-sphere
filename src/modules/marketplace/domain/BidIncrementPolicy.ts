export class BidIncrementPolicy {
  /**
   * Returns the minimum accepted next bid amount based on the current highest bid.
   */
  static getMinimumNextBid(currentHighestBid: number): number {
    // Basic step policy. Can be swapped with dynamic policy.
    if (currentHighestBid < 10) return currentHighestBid + 1;
    if (currentHighestBid < 50) return currentHighestBid + 5;
    if (currentHighestBid < 100) return currentHighestBid + 10;
    return currentHighestBid + 25;
  }
}
