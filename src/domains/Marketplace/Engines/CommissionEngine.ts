export class CommissionEngine {
  /**
   * Calculates the commission owed to the platform based on the tenant's plan
   */
  static calculatePlatformFee(tenantPlan: string, amount: number): number {
    let rate = 0.10; // Default Standard 10%
    if (tenantPlan === 'PREMIUM') rate = 0.08;
    if (tenantPlan === 'ENTERPRISE') rate = 0.05;

    return amount * rate;
  }
}
