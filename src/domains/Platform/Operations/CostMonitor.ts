import { MetricsEngine } from './MetricsEngine';

export class CostMonitor {
  /**
   * Tracks operational costs that are not directly tied to transaction financial flows.
   */
  static trackResourceUsage(resourceType: 'AI_TOKENS' | 'EMAIL_SENT' | 'WEBHOOK_FIRED' | 'STORAGE_MB', amount: number, tenantId?: string) {
    // console.log(`[CostMonitor] Tenant ${tenantId || 'SYSTEM'} consumed ${amount} of ${resourceType}`);
    MetricsEngine.incrementCounter(`cost.${resourceType}`, amount);
  }
}
