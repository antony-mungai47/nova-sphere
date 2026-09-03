import { Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/prisma";
import { PromotionData } from "../../domain/pricing/types";

export class DiscountRepository {
  /**
   * Fetch active promotions for a tenant.
   * Returns PromotionData formatted for pure Domain calculation.
   */
  static async getActivePromotions(tenantId: string, tx?: Prisma.TransactionClient): Promise<PromotionData[]> {
    const client = tx || defaultPrisma;
    
    // In a real system we'd filter by date in the query too, but 
    // for purity we can just fetch all active and let the calculator decide,
    // or filter here for efficiency. Let's filter for efficiency but keep pure calculation.
    const promotions = await client.promotion.findMany({
      where: { 
        tenantId,
        isActive: true
      }
    });

    return promotions.map(p => ({
      id: p.id,
      type: p.type as any,
      discountValue: p.discountValue,
      tenantId: p.tenantId,
      applicableCategoryIds: p.applicableCategoryIds.length > 0 ? p.applicableCategoryIds : undefined,
      minSubtotal: p.minSubtotal ?? undefined,
      isActive: p.isActive,
      expiresAt: p.expiresAt
    }));
  }
}
