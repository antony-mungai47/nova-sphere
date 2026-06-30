export type FeatureFlag = 
  | 'ENABLE_RECOMMENDATION_ENGINE'
  | 'ENABLE_SEARCH_PROVIDER_ALGOLIA'
  | 'ENABLE_SEARCH_PROVIDER_MEILISEARCH'
  | 'ENABLE_USER_ACTIVITY_TRACKING'
  | 'ENABLE_AUCTION_REALTIME'
  | 'ENABLE_INTELLIGENCE_DASHBOARD';

// In a real enterprise app, these would come from LaunchDarkly, Statsig, or Vercel Edge Config
// For now, we control them via environment variables or hardcoded fallbacks
export const featureFlags: Record<FeatureFlag, boolean> = {
  ENABLE_RECOMMENDATION_ENGINE: process.env.NEXT_PUBLIC_FF_RECOMMENDATION_ENGINE === 'true',
  ENABLE_SEARCH_PROVIDER_ALGOLIA: process.env.NEXT_PUBLIC_FF_SEARCH_ALGOLIA === 'true',
  ENABLE_SEARCH_PROVIDER_MEILISEARCH: process.env.NEXT_PUBLIC_FF_SEARCH_MEILISEARCH === 'true',
  ENABLE_USER_ACTIVITY_TRACKING: process.env.NEXT_PUBLIC_FF_USER_ACTIVITY === 'true',
  ENABLE_AUCTION_REALTIME: process.env.NEXT_PUBLIC_FF_AUCTION_REALTIME === 'true',
  ENABLE_INTELLIGENCE_DASHBOARD: process.env.NEXT_PUBLIC_FF_INTELLIGENCE_DASHBOARD === 'true',
};

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag] || false;
}
