"use server";

import { FeatureFlagRepository } from "./repositories/featureFlag.repository";
import { FeatureFlagCache } from "./services/featureFlagCache";
import { FeatureFlag } from "@prisma/client";

// In a real app, you would retrieve the admin ID from the session (e.g. Clerk)
// For demonstration, we hardcode an admin ID or expect it to be passed in.
const SYSTEM_ADMIN_ID = "SYSTEM_ADMIN";

export async function toggleFeatureFlag(id: string, enabled: boolean, reason: string = "Manual toggle via dashboard") {
  try {
    await FeatureFlagRepository.update(id, { enabled }, SYSTEM_ADMIN_ID, reason, "127.0.0.1");
    FeatureFlagCache.revalidate();
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle feature flag", error);
    return { success: false, error: "Failed to toggle flag" };
  }
}

export async function updateFeatureFlagRollout(id: string, rolloutPercentage: number, reason: string = "Updated rollout percentage") {
  try {
    await FeatureFlagRepository.update(id, { rolloutPercentage }, SYSTEM_ADMIN_ID, reason, "127.0.0.1");
    FeatureFlagCache.revalidate();
    return { success: true };
  } catch (error) {
    console.error("Failed to update feature flag rollout", error);
    return { success: false, error: "Failed to update rollout" };
  }
}

export async function updateFeatureFlagSchedule(id: string, startDate: Date | null, endDate: Date | null, reason: string = "Updated schedule") {
  try {
    await FeatureFlagRepository.update(id, { startDate, endDate }, SYSTEM_ADMIN_ID, reason, "127.0.0.1");
    FeatureFlagCache.revalidate();
    return { success: true };
  } catch (error) {
    console.error("Failed to update feature flag schedule", error);
    return { success: false, error: "Failed to update schedule" };
  }
}
