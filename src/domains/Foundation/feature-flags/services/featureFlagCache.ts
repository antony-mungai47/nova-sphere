import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import { FeatureFlagRepository } from "../repositories/featureFlag.repository";
import { FeatureFlag } from "@prisma/client";

const FEATURE_FLAGS_CACHE_TAG = "feature-flags";

export class FeatureFlagCache {
  /**
   * Fetches all feature flags from the database and caches them indefinitely.
   * This cache is only invalidated when an admin updates a flag.
   */
  static async getAllFlags(): Promise<FeatureFlag[]> {
    const getCachedFlags = unstable_cache(
      async () => {
        return FeatureFlagRepository.findAll();
      },
      ["all-feature-flags"],
      {
        tags: [FEATURE_FLAGS_CACHE_TAG],
      }
    );
    
    return getCachedFlags();
  }

  /**
   * Invalidates the feature flags cache.
   * Call this whenever a feature flag is created, updated, or deleted.
   */
  static revalidate(): void {
    // @ts-expect-error Next.js 14 typings mismatch
    revalidateTag(FEATURE_FLAGS_CACHE_TAG);
  }
}
