import { prisma } from "@/lib/prisma";

export class ChaosEngine {
  /**
   * Middleware hook to artificially inject faults for Resilience Testing.
   * Only active if the CHAOS_ENABLED feature flag is true.
   */
  static async injectFault(dependency: "DATABASE" | "STRIPE" | "REDIS" | "SEARCH") {
    // 1. Check if Chaos Engineering is globally enabled
    const chaosFlag = await prisma.featureFlag.findUnique({ where: { key: "CHAOS_ENABLED" } });
    if (!chaosFlag || !chaosFlag.enabled) return;

    // 2. Check if specific dependency chaos is enabled (e.g. CHAOS_STRIPE_TIMEOUT)
    const specificFlag = await prisma.featureFlag.findUnique({ where: { key: `CHAOS_${dependency}` } });
    if (!specificFlag || !specificFlag.enabled) return;

    // 3. Roll the dice against the rolloutPercentage
    const roll = Math.random() * 100;
    if (roll > specificFlag.rolloutPercentage) return;

    // 4. Inject the fault
    console.warn(`[CHAOS_ENGINE] Injecting simulated failure for ${dependency}`);
    
    switch (dependency) {
      case "DATABASE":
        throw new Error("ChaosEngine: Simulated Database Connection Timeout (P1001)");
      case "STRIPE":
        throw new Error("ChaosEngine: Simulated Stripe API Timeout");
      case "REDIS":
        throw new Error("ChaosEngine: Simulated Redis Connection Refused");
      case "SEARCH":
        throw new Error("ChaosEngine: Simulated Search Provider 503 Service Unavailable");
    }
  }
}
