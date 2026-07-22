export type AuctionState = "DRAFT" | "SCHEDULED" | "LIVE" | "PAUSED" | "CLOSING" | "CLOSED" | "SETTLED" | "CANCELLED";

export class AuctionStateMachine {
  private static allowedTransitions: Record<AuctionState, AuctionState[]> = {
    DRAFT: ["SCHEDULED", "LIVE", "CANCELLED"],
    SCHEDULED: ["LIVE", "CANCELLED", "DRAFT"],
    LIVE: ["PAUSED", "CLOSING", "CLOSED", "CANCELLED"],
    PAUSED: ["LIVE", "CANCELLED"],
    CLOSING: ["CLOSED"],
    CLOSED: ["SETTLED"],
    SETTLED: [],
    CANCELLED: []
  };

  static validateTransition(currentState: string, targetState: string) {
    const state = currentState as AuctionState;
    const target = targetState as AuctionState;
    
    if (!this.allowedTransitions[state]?.includes(target)) {
      throw new Error(`IllegalStateTransitionError: Cannot transition from ${state} to ${target}`);
    }
  }

  static canAcceptBids(state: string): boolean {
    return state === "LIVE" || state === "CLOSING";
  }
}
