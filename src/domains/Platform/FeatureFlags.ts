export interface FeatureFlagContext {
  userId?: string;
  segment?: string;
  region?: string;
}

/**
 * Service to manage progressive rollouts and feature gating.
 * E.g., routing 10% of users to AI Search while keeping 90% on Legacy.
 */
export class FeatureFlagService {
  private flags: Map<string, any> = new Map();

  constructor() {
    // In production, these would be fetched from a DB or Config Service (e.g., LaunchDarkly)
    this.flags.set("ai_search_rollout", { percentage: 20 }); 
    this.flags.set("dynamic_pricing", { enabled: false });
    this.flags.set("new_refund_workflow", { enabled: true, segment: "beta_testers" });
  }

  public isEnabled(flagKey: string, context?: FeatureFlagContext): boolean {
    const flag = this.flags.get(flagKey);
    if (!flag) return false;

    if (flag.enabled !== undefined) {
      if (flag.segment && context?.segment !== flag.segment) {
        return false;
      }
      return flag.enabled;
    }

    if (flag.percentage !== undefined) {
      // Deterministic rollout based on userId hash
      if (!context?.userId) return false;
      const hash = this.hashString(context.userId);
      return (hash % 100) < flag.percentage;
    }

    return false;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

export const GlobalFeatureFlags = new FeatureFlagService();
