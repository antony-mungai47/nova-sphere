import { prisma } from '@/lib/prisma';

export class StorefrontEngine {
  /**
   * Retrieves a storefront by its unique slug
   */
  static async getStorefront(slug: string) {
    return prisma.store.findUnique({
      where: { slug },
      include: {
        tenant: {
          include: { products: { where: { approvalStatus: 'PUBLISHED' } } }
        }
      }
    });
  }

  /**
   * Updates storefront branding and policies
   */
  static async updateStorefront(tenantId: string, updates: { logoUrl?: string, returnPolicy?: string }) {
    return prisma.store.update({
      where: { tenantId },
      data: updates
    });
  }
}

