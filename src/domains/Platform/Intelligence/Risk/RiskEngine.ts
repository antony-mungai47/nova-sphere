import { prisma } from '@/lib/prisma';

export class RiskEngine {
  /**
   * Evaluates the risk associated with a specific context (Order, Signup, Payout).
   * Returns LOW, MEDIUM, HIGH, or CRITICAL.
   */
  static async evaluateRisk(contextType: string, contextId: string, payload: any): Promise<any> {
    console.log(`[RiskEngine] Evaluating risk for ${contextType} ${contextId}`);
    
    let score = 10; // Base score
    const flags: string[] = [];

    // Rule 1: High Velocity
    if (payload.orderCountLastHour > 3) {
      score += 30;
      flags.push('HIGH_VELOCITY');
    }

    // Rule 2: Device Fingerprint mismatch
    if (payload.deviceHash && payload.historicalDeviceHash && payload.deviceHash !== payload.historicalDeviceHash) {
      score += 20;
      flags.push('DEVICE_MISMATCH');
    }

    // Rule 3: AI Behavior Score
    if (payload.aiScore && payload.aiScore > 80) {
      score += 40;
      flags.push('AI_ABUSE_FLAG');
    }

    // Map score to state
    let state = 'LOW';
    let resolution = 'AUTO_APPROVED';
    if (score > 80) {
      state = 'CRITICAL';
      resolution = 'REJECTED';
    } else if (score > 50) {
      state = 'HIGH';
      resolution = 'HOLD_FOR_REVIEW';
    } else if (score > 25) {
      state = 'MEDIUM';
      resolution = 'ADDITIONAL_VERIFICATION_REQUIRED';
    }

    return prisma.riskEvaluation.create({
      data: {
        contextType,
        contextId,
        ipAddress: payload.ipAddress,
        deviceHash: payload.deviceHash,
        riskScore: score,
        riskState: state,
        flags: flags,
        resolution
      }
    });
  }
}
