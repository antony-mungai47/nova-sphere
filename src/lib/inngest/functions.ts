import { inngest } from "./client";
import { ReconciliationEngine } from "@/domains/Finance/ReconciliationEngine/ReconciliationEngine";

export const scheduledReconciliation = inngest.createFunction(
  {
    id: "daily-payment-reconciliation",
    triggers: [{ cron: "0 0 * * *" }]
  },
  async ({ step }) => {
    const result = await step.run("run-reconciliation", async () => {
      return await ReconciliationEngine.reconcileDaily();
    });
    return { event: "Reconciliation completed", result };
  }
);

export const scheduledCartCleanup = inngest.createFunction(
  {
    id: "hourly-cart-cleanup",
    triggers: [{ cron: "0 * * * *" }]
  },
  async ({ step }) => {
    const result = await step.run("run-cart-cleanup", async () => {
      // Placeholder implementation:
      return { cleaned: true };
    });
    return { event: "Cart cleanup completed", result };
  }
);
