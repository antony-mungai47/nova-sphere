import { prisma } from '@/lib/prisma';
import { KYCStatus, StoreStatus } from '@prisma/client';

export class VendorEngine {
  /**
   * Transitions KYC from DRAFT to SUBMITTED
   */
  static async submitKYC(tenantId: string, documentUrls: { identityDocUrl?: string, businessDocUrl?: string }) {
    return await prisma.kYCProfile.update({
      where: { tenantId },
      data: {
        status: KYCStatus.SUBMITTED,
        ...documentUrls
      }
    });
  }

  /**
   * Automates the entire Vendor provisioning lifecycle.
   * - Approves KYC and Tenant
   * - Provisions Store
   * - Creates VendorWallet
   * - Provisions default roles, etc.
   */
  static async approveTenant(tenantId: string, ownerUserId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Approve Tenant and KYC
      await tx.tenant.update({
        where: { id: tenantId },
        data: { status: 'APPROVED' }
      });

      await tx.kYCProfile.update({
        where: { tenantId },
        data: { status: KYCStatus.APPROVED }
      });

      // 2. Map Owner Role
      await tx.tenantUser.create({
        data: {
          tenantId,
          userId: ownerUserId,
          role: 'OWNER'
        }
      });

      // 3. Provision Store (Active by default)
      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
      const slug = tenant?.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || tenantId;

      await tx.store.create({
        data: {
          tenantId,
          name: tenant?.name || 'New Store',
          slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
          status: StoreStatus.ACTIVE
        }
      });

      // 4. Create VendorWallet
      await tx.vendorWallet.create({
        data: { tenantId }
      });

      // 5. Create Default Commission Policy (Optional, relies on global fallback if missing)
      // We assume global policy handles it, but we could provision a specific one here.
      
      // In a real system, you'd also provision Shipping profiles, Tax settings, etc. here.
      
      return true;
    });
  }
}
