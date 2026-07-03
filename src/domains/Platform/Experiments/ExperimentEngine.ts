import { prisma } from '@/lib/prisma';
import { getFeatureFlag } from '@/domains/Foundation/feature-flags/actions';
import { ExperimentVariant } from '@prisma/client';
import crypto from 'crypto';

export class ExperimentEngine {
  /**
   * Retrieves the variant for a given user.
   * Note: The feature flag gating whether the experiment runs should be checked BEFORE calling this.
   */
  static async getVariant(experimentKey: string, userId: string): Promise<ExperimentVariant | null> {
    const experiment = await prisma.experiment.findUnique({
      where: { key: experimentKey },
      include: { variants: true }
    });

    if (!experiment || experiment.status !== 'RUNNING') return null;

    // Check if user is already allocated
    const existingAllocation = await prisma.experimentAllocation.findUnique({
      where: {
        experimentId_userId: {
          experimentId: experiment.id,
          userId
        }
      },
      include: { variant: true }
    });

    if (existingAllocation) {
      return existingAllocation.variant;
    }

    // Bucket the user deterministically
    const hash = crypto.createHash('md5').update(`${experimentKey}:${userId}`).digest('hex');
    const hashInt = parseInt(hash.substring(0, 8), 16);
    const bucket = hashInt % 100; // 0 to 99

    let cumulativeWeight = 0;
    let selectedVariant = experiment.variants[0];

    for (const variant of experiment.variants) {
      cumulativeWeight += variant.weight;
      if (bucket < cumulativeWeight) {
        selectedVariant = variant;
        break;
      }
    }

    if (!selectedVariant) return null;

    // Persist allocation
    await prisma.experimentAllocation.create({
      data: {
        experimentId: experiment.id,
        userId,
        variantId: selectedVariant.id
      }
    });

    return selectedVariant;
  }
}
