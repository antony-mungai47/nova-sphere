import { AffinityProfile } from "./types";

export class AffinityCalculator {
  private currentAffinities: AffinityProfile = {
    // Starting defaults
    photography: 0.1,
    gaming: 0.1,
    fashion: 0.1,
    budget: 0.5,
    premium: 0.5,
  };

  /**
   * Calculates immediate affinities based on recent signals
   * @param recentSignals Array of recent event names/payloads
   */
  public async calculate(recentSignals: any[]): Promise<AffinityProfile> { return this.currentAffinities; }

  public getAffinities(): AffinityProfile {
    return this.currentAffinities;
  }
}
