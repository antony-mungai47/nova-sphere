import { prisma } from "@/lib/prisma";
import { FeatureFlagType } from "@prisma/client";

export class DeploymentEngine {
  /**
   * Promotes a feature flag rollout safely (Canary Release).
   * E.g., shifts from 10% to 25% traffic.
   */
  static async shiftTraffic(flagKey: string, newPercentage: number) {
    if (newPercentage < 0 || newPercentage > 100) {
      throw new Error("Percentage must be between 0 and 100");
    }

    const flag = await prisma.featureFlag.findUnique({ where: { key: flagKey } });
    if (!flag) throw new Error("Feature flag not found");

    const updated = await prisma.featureFlag.update({
      where: { key: flagKey },
      data: { rolloutPercentage: newPercentage, enabled: newPercentage > 0 }
    });

    // Record the history for audit compliance
    await prisma.featureFlagHistory.create({
      data: {
        featureFlagId: updated.id,
        reason: `Automated Canary Shift to ${newPercentage}%`,
        changedBy: "SYSTEM_DEPLOYMENT_ENGINE"
      }
    });

    return updated;
  }

  /**
   * Immediately rolls back a feature to 0% if error budget triggers an alert.
   */
  static async emergencyRollback(flagKey: string, incidentId: string) {
    const updated = await prisma.featureFlag.update({
      where: { key: flagKey },
      data: { rolloutPercentage: 0, enabled: false }
    });

    await prisma.featureFlagHistory.create({
      data: {
        featureFlagId: updated.id,
        reason: `Emergency Rollback triggered by Incident ${incidentId}`,
        changedBy: "SYSTEM_INCIDENT_ENGINE"
      }
    });

    return updated;
  }
}
