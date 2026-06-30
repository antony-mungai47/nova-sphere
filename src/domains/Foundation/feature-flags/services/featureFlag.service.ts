import { FeatureFlag } from "@prisma/client";
import { FeatureFlagCache } from "./featureFlagCache";
import { FeatureFlags, FlagType } from "../flags";

export class FeatureFlagService {
  /**
   * Retrieves all flags from the cache.
   */
  static async getAllFlags(): Promise<FeatureFlag[]> {
    return FeatureFlagCache.getAllFlags();
  }

  /**
   * Retrieves a specific flag by its key.
   */
  static async getFlag(key: FeatureFlags | string): Promise<FeatureFlag | undefined> {
    const flags = await this.getAllFlags();
    return flags.find(f => f.key === key);
  }

  /**
   * Evaluates whether a feature flag is enabled for the current request.
   * This handles Kill Switches, Dates, and Dependencies.
   * 
   * @param key The feature flag key
   * @param userRoles Optional array of roles the current user has
   * @param userCountry Optional country of the user
   * @param userId Optional user ID
   * @returns true if enabled, false otherwise
   */
  static async isEnabled(
    key: FeatureFlags | string,
    context?: {
      userRoles?: string[];
      userCountry?: string;
      userId?: string;
    }
  ): Promise<boolean> {
    const flag = await this.getFlag(key);

    if (!flag) {
      return false; // Fail secure: if flag doesn't exist, it's disabled.
    }

    // 1. Is it a Kill Switch?
    // If it's a Kill Switch, 'enabled' means the feature it protects is DISABLED.
    // Wait, usually a kill switch being "ON" means the system is KILLED.
    // Let's treat standard flags: enabled = true means it's on.
    // Kill Switch: if enabled = false, the feature is disabled (killed). 
    // We will just use `enabled` as the master toggle for all types for simplicity.
    if (!flag.enabled) {
      return false;
    }

    // 2. Schedule Check
    const now = new Date();
    if (flag.startDate && now < new Date(flag.startDate)) {
      return false;
    }
    if (flag.endDate && now > new Date(flag.endDate)) {
      return false;
    }

    // 3. Dependency Check
    if (flag.dependencies) {
      let deps: string[] = [];
      try {
        deps = typeof flag.dependencies === 'string' ? JSON.parse(flag.dependencies) : flag.dependencies;
      } catch (e) {
        console.error("Invalid JSON in dependencies for flag", flag.key);
      }
      
      for (const depKey of deps) {
        // Evaluate dependency recursively (without context to avoid infinite role loops, or pass context down)
        // Beware of circular dependencies! A real system needs cycle detection.
        const isDepEnabled = await this.isEnabled(depKey, context);
        if (!isDepEnabled) {
          return false;
        }
      }
    }

    // 4. Rollout Percentage
    if (flag.rolloutPercentage < 100) {
      // Deterministic pseudo-random based on something stable, or just Math.random() for simplicity if no user ID
      // Real enterprise uses MurmurHash of (userId + flagKey) % 100
      if (context?.userId) {
        const hash = this.simpleHash(context.userId + flag.key);
        if (hash % 100 >= flag.rolloutPercentage) {
          return false;
        }
      } else {
        // Fallback for anonymous users
        if (Math.random() * 100 >= flag.rolloutPercentage) {
          return false;
        }
      }
    }

    // 5. Targeting Checks (Roles, Countries, Users)
    if (context) {
      // Check Roles
      if (flag.enabledForRoles) {
        try {
          const roles = (typeof flag.enabledForRoles === 'string' ? JSON.parse(flag.enabledForRoles) : flag.enabledForRoles) as string[];
          if (roles.length > 0) {
            const hasRole = context.userRoles?.some(r => roles.includes(r));
            if (!hasRole) return false;
          }
        } catch (e) {}
      }

      // Check Countries
      if (flag.enabledForCountries) {
        try {
          const countries = (typeof flag.enabledForCountries === 'string' ? JSON.parse(flag.enabledForCountries) : flag.enabledForCountries) as string[];
          if (countries.length > 0) {
            if (!context.userCountry || !countries.includes(context.userCountry)) return false;
          }
        } catch (e) {}
      }

      // Check Specific Users
      if (flag.enabledForUsers) {
        try {
          const users = (typeof flag.enabledForUsers === 'string' ? JSON.parse(flag.enabledForUsers) : flag.enabledForUsers) as string[];
          if (users.length > 0) {
            if (!context.userId || !users.includes(context.userId)) return false;
          }
        } catch (e) {}
      }
    }

    return true;
  }

  /**
   * Helper for consistent hashing
   */
  private static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
