import { GlobalAIControls } from "../Admin/AIControls";

/**
 * Tracks AI spend and automatically disables capabilities if budgets are breached.
 */
export class BudgetMonitor {
  private currentSpendTokens: Map<string, number> = new Map();

  public trackUsage(capabilityId: string, tokens: number): void {
    const current = this.currentSpendTokens.get(capabilityId) || 0;
    const newTotal = current + tokens;
    this.currentSpendTokens.set(capabilityId, newTotal);

    this.evaluateBudget(capabilityId, newTotal);
  }

  private evaluateBudget(capabilityId: string, currentTokens: number): void {
    const capability = GlobalAIControls.getCapability(capabilityId);
    if (!capability) return;

    const limit = capability.dailyBudgetTokens;
    const percentage = currentTokens / limit;

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
