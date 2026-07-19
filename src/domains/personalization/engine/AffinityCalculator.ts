import { AffinityProfile } from "./types";
import { GlobalAIOrchestrator } from "../../AI/orchestrator/AIOrchestrator";
import { AffinityPrompts } from "../../AI/prompts";

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
  public async calculate(recentSignals: any[]): Promise<AffinityProfile> {
    const profile = { ...this.currentAffinities };
    
    if (recentSignals.length === 0) return profile;

    // 1. Try AI Intent Extraction
    const prompt = AffinityPrompts.v1.replace("{{signals}}", JSON.stringify(recentSignals));
    const aiResponse = await GlobalAIOrchestrator.generate(prompt, { provider: "claude" });

    if (aiResponse) {
      try {
        const aiAffinities = JSON.parse(aiResponse);
        // Blend AI prediction with current state
        if (aiAffinities.photography) profile.photography = Math.min(1.0, profile.photography + (aiAffinities.photography * 0.3));
        if (aiAffinities.gaming) profile.gaming = Math.min(1.0, profile.gaming + (aiAffinities.gaming * 0.3));
        if (aiAffinities.premium) profile.premium = Math.min(1.0, profile.premium + (aiAffinities.premium * 0.4));
        if (aiAffinities.budget) profile.budget = Math.max(0.0, profile.budget - (aiAffinities.premium * 0.2));
        
        this.currentAffinities = profile;
        return profile;
      } catch (e) {
        // Fallback to heuristics if AI response is unparseable
      }
    }

    // 2. Heuristic Fallback (AI Failed or Offline)
    console.warn("[AffinityCalculator] AI Failed. Falling back to Heuristics.");
    if (recentSignals.some(s => s.payload?.category === 'photography')) {
      profile.photography = Math.min(1.0, profile.photography + 0.3);
    }

    if (recentSignals.some(s => s.eventName === 'cart.added' && s.payload?.price > 1000)) {
      profile.premium = Math.min(1.0, profile.premium + 0.4);
      profile.budget = Math.max(0.0, profile.budget - 0.2);
    }

    this.currentAffinities = profile;
    return this.currentAffinities;
  }

  public getAffinities(): AffinityProfile {
    return this.currentAffinities;
  }
}
