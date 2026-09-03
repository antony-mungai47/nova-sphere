import { Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/prisma";
import { CouponData } from "../../domain/pricing/types";

export class CouponRepository {
  /**
   * Fetch a coupon by code. 
   * Returns CouponData formatted for pure Domain calculation.
   */
  static async findByCode(code: string, tenantId: string, tx?: Prisma.TransactionClient): Promise<CouponData | null> {
    const client = tx || defaultPrisma;
    
    // Structurally enforce tenant boundary at the repository query level
    const coupon = await client.coupon.findFirst({
      where: { code, tenantId }
    });

    if (!coupon) return null;

    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type as any,
      discountValue: coupon.discountValue,
      minSubtotal: coupon.minSubtotal ?? undefined,
      maxDiscount: coupon.maxDiscount ?? undefined,
      tenantId: coupon.tenantId,
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt,
      maxUses: coupon.maxUses ?? undefined,
      currentUses: coupon.currentUses,
      version: coupon.version
    };
  }

  /**
   * Fetches an existing redemption to ensure idempotency.
   */
  static async findRedemption(idempotencyKey: string, tx?: Prisma.TransactionClient) {
    const client = tx || defaultPrisma;
    return client.couponRedemption.findUnique({
      where: { idempotencyKey }
    });
  }

  /**
   * Records a redemption and returns it.
   */
  static async recordRedemption(data: {
    couponId: string;
    orderId: string;
    userId: string;
    idempotencyKey: string;
    discountAmount: number;
  }, tx: Prisma.TransactionClient) {
    return tx.couponRedemption.create({
      data
    });
  }

  /**
   * Atomically increments coupon usage with concurrency limit check.
   */
  static async incrementUsage(code: string, currentVersion: number, maxUses: number | undefined, tx: Prisma.TransactionClient) {
    // We update only if the version matches. If it has maxUses, we also enforce currentUses < maxUses
    // We could do this using Prisma `updateMany` for atomic safe updates.
    
    const whereClause: Prisma.CouponWhereInput = {
      code,
      version: currentVersion
    };

    if (maxUses !== undefined) {
      whereClause.currentUses = { lt: maxUses };
    }

    const res = await tx.coupon.updateMany({
      where: whereClause,
      data: {
        currentUses: { increment: 1 },
        version: { increment: 1 }
      }
    });

    if (res.count === 0) {
      throw new Error("ConcurrencyConflictException: The coupon was modified by another transaction or usage limit exceeded.");
    }
    
    return res;
  }
}
