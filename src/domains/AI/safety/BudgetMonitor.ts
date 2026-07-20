import { GlobalAIControls } from "../Admin/AIControls";

/**
 * Tracks AI spend and automatically disables capabilities if budgets are breached.
 */
export class BudgetMonitor {
  private currentSpendTokens: Map<string, number> = new Map();

  public async trackUsage(capabilityId: string, tokens: number): Promise<void> {
    const current = this.currentSpendTokens.get(capabilityId) || 0;
    const newTotal = current + tokens;
    this.currentSpendTokens.set(capabilityId, newTotal);

    // Sync with Prisma AIBudget
    try {
      const { prisma } = await import("@/lib/prisma");
      // Use tenantId 'GLOBAL' for overall system tracking or capabilityId for specific
      const budget = await prisma.aIBudget.upsert({
        where: { tenantId: 'GLOBAL' },
        update: { currentUsage: { increment: tokens } },
        create: {
          tenantId: 'GLOBAL',
          monthlyLimit: 1000000,
          currentUsage: tokens,
          alertThreshold: 800000,
        }
      });
      
      this.evaluateBudget(capabilityId, newTotal, budget.monthlyLimit, budget.currentUsage);
    } catch (e) {
      console.error(`[BudgetMonitor] Failed to sync with AIBudget`, e);
      // Fallback to local evaluation
      this.evaluateBudget(capabilityId, newTotal);
    }
  }

  private evaluateBudget(capabilityId: string, currentTokens: number, limitFromDb?: number, usageFromDb?: number): void {
    const capability = GlobalAIControls.getCapability(capabilityId);
    if (!capability) return;

    const limit = limitFromDb || capability.dailyBudgetTokens;
    const usage = usageFromDb || currentTokens;
    const percentage = usage / limit;

    if (percentage >= 1.0 && capability.enabled) {
      console.error(`[EMERGENCY] AI Budget breached for ${capability.name} (100%). Disabling feature.`);
      GlobalAIControls.setEnabled(capabilityId, false);
    } else if (percentage >= 0.95) {
      console.warn(`[WARNING] AI Budget at 95% for ${capability.name}. Emergency Mode pending.`);
    } else if (percentage >= 0.80) {
      console.info(`[INFO] AI Budget at 80% for ${capability.name}.`);
    }
  }
}

export const GlobalBudgetMonitor = new BudgetMonitor();
