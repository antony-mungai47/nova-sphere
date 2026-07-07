import { prisma } from '@/lib/prisma';
import { CommissionPolicy } from '@prisma/client';

export interface CommissionResult {
  marketplaceFee: number;
  vendorPayout: number;
}

export class CommissionEngine {
  /**
   * Evaluates the marketplace commission based on policies.
   */
  static async calculateCommission(tenantId: string, subtotal: number): Promise<CommissionResult> {
    // Look for tenant-specific policy first
    let policy = await prisma.commissionPolicy.findUnique({
      where: { tenantId }
    });

    if (!policy) {
      // Fallback to global policy (tenantId = null)
      const policies = await prisma.commissionPolicy.findMany({
        where: { tenantId: null },
        take: 1
      });
      
      if (policies.length > 0) {
        policy = policies[0];
      }
    }

    // Default hardcode fallback if no global policy exists
    const percentage = policy ? Number(policy.percentage) : 10.0;
    const fixedFee = policy ? Number(policy.fixedFee) : 0.0;

    const marketplaceFee = (subtotal * (percentage / 100)) + fixedFee;
    const vendorPayout = subtotal - marketplaceFee;

    return {
      marketplaceFee: Number(marketplaceFee.toFixed(2)),
      vendorPayout: Number(vendorPayout.toFixed(2))
    };
  }
}
