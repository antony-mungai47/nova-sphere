import { prisma } from '@/lib/prisma';
import { KYCProfile } from '@prisma/client';

export class KYCEngine {
  /**
   * Evaluates the risk score of a KYC profile and determines whether
   * manual review is needed or if it can be auto-approved/rejected.
   */
  static async evaluateProfile(tenantId: string): Promise<KYCProfile | null> {
    const profile = await prisma.kYCProfile.findUnique({
      where: { tenantId }
    });

    if (!profile || profile.status !== 'PENDING_REVIEW') return profile;

    // Simulate AI Moderation scan for documents
    // If AI risk score is > 80, auto-reject
    // If AI risk score is < 20, auto-approve
    // Otherwise, leave in PENDING_REVIEW for manual check
    
    // Stubbing AI evaluation:
    const mockRiskScore = Math.floor(Math.random() * 100);
    
    let newStatus = profile.status;
    let rejectionReason = profile.rejectionReason;

    if (mockRiskScore > 80) {
      newStatus = 'REJECTED';
      rejectionReason = 'Automated risk flag raised on identity documents.';
    } else if (mockRiskScore < 20) {
      newStatus = 'APPROVED';
    }

    const updated = await prisma.kYCProfile.update({
      where: { tenantId },
      data: {
        aiRiskScore: mockRiskScore,
        status: newStatus,
        rejectionReason
      }
    });

    // If approved, activate the Tenant
    if (newStatus === 'APPROVED') {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { status: 'APPROVED' }
      });
    } else if (newStatus === 'REJECTED') {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { status: 'REJECTED' }
      });
    }

    return updated;
  }
}
