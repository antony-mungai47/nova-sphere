import { MetricsEngine } from './MetricsEngine';

export class FeatureFlagMonitor {
  /**
   * Monitors the health and traffic volume of a progressive rollout feature flag.
   */
  static trackFlagEvaluation(flagName: string, isEnabled: boolean, hasError: boolean = false) {
    const outcome = isEnabled ? 'enabled' : 'disabled';
    MetricsEngine.incrementCounter(`feature_flag.${flagName}.evaluated.${outcome}`);

    if (hasError) {
      MetricsEngine.incrementCounter(`feature_flag.${flagName}.errors`);
      // console.warn(`[FeatureFlagMonitor] Error tracked during evaluation of ${flagName}`);
    }
  }
}
