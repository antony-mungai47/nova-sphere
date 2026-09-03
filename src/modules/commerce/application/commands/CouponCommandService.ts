import { Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/prisma";
import { CouponRepository } from "../../infrastructure/repositories/CouponRepository";
import { DomainEvents } from "@/domains/Foundation/events/event-bus";
import { RuntimeGate } from "@/lib/observability/assertions";

export interface RedeemCouponCommand {
  code: string;
  orderId: string;
  userId: string;
  tenantId: string;
  discountAmount: number;
  idempotencyKey: string;
  traceId: string;
}

export class CouponCommandService {
  /**
   * Redeems a coupon atomically, increments its usage, and emits domain events.
   * This operates in a transaction to prevent race conditions or overselling limited-use coupons.
   */
  static async redeemCoupon(cmd: RedeemCouponCommand, externalTx?: Prisma.TransactionClient): Promise<boolean> {
    const execute = async (tx: Prisma.TransactionClient) => {
      // 1. Idempotency Check
      const existingRedemption = await CouponRepository.findRedemption(cmd.idempotencyKey, tx);
      if (existingRedemption) {
        return true; // Already redeemed idempotently
      }

      // 2. Fetch Coupon Facts (Revalidation inside transaction)
      const coupon = await CouponRepository.findByCode(cmd.code, cmd.tenantId, tx);
      if (!coupon) {
        throw new Error(`Coupon not found or tenant mismatch: ${cmd.code}`);
      }

      if (!coupon.isActive) {
        throw new Error(`Coupon inactive: ${cmd.code}`);
      }

      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw new Error(`Coupon expired: ${cmd.code}`);
      }

      // 3. Gate 14: Tenant Isolation Check
      RuntimeGate.assertTenantIsolation(cmd.tenantId, coupon.tenantId, 'Coupon', coupon.code, cmd.traceId);

      // 4. Validate usage bounds
      if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
        throw new Error(`CouponUsageLimitExceeded: Coupon ${cmd.code} has reached its maximum usage limit.`);
      }

      // 5. Atomic Usage Increment (Concurrency Control)
      // We pass the current version we read, ensuring no other transaction mutated it in the meantime.
      await CouponRepository.incrementUsage(cmd.code, coupon.version, coupon.maxUses ?? undefined, tx);

      // 6. Record Redemption
      await CouponRepository.recordRedemption({
        couponId: coupon.id,
        orderId: cmd.orderId,
        userId: cmd.userId,
        idempotencyKey: cmd.idempotencyKey,
        discountAmount: cmd.discountAmount
      }, tx);
      
      return true;
    };

    if (externalTx) {
      await execute(externalTx);
    } else {
      await defaultPrisma.$transaction(execute);
    }

    // Post-commit event emission
    DomainEvents.publish('coupon.redeemed', {
      couponCode: cmd.code,
      orderId: cmd.orderId,
      userId: cmd.userId,
      tenantId: cmd.tenantId,
      discountAmount: cmd.discountAmount,
      traceId: cmd.traceId,
      timestamp: new Date().toISOString()
    });

    return true;
  }
}
