import { CartPricingInput, PricingCalculationDTO } from "../../domain/pricing/types";
import { PricingCalculator } from "../../domain/pricing/PricingCalculator";
import { CouponRepository } from "../../infrastructure/repositories/CouponRepository";
import { DiscountRepository } from "../../infrastructure/repositories/DiscountRepository";
import { RuntimeGate } from "@/lib/observability/assertions";

export class PricingQueryService {
  /**
   * Deterministic calculation of discounts and promotions.
   * Performs READ ONLY database operations to fetch Coupon and Promotion facts,
   * then delegates completely to the pure PricingCalculator.
   */
  static async calculateDiscounts(
    cart: CartPricingInput, 
    couponCodes: string[], 
    traceId: string
  ): Promise<PricingCalculationDTO> {
    
    // 1. Fetch Coupon Facts (Read Only)
    const coupons = [];
    for (const code of couponCodes) {
      const coupon = await CouponRepository.findByCode(code, cart.tenantId);
      if (coupon) {
        // Gate 14: Tenant Isolation Check
        RuntimeGate.assertTenantIsolation(cart.tenantId, coupon.tenantId, 'Coupon', coupon.code, traceId);
        coupons.push(coupon);
      }
    }

    // 2. Fetch Promotion Facts (Read Only)
    const promotions = await DiscountRepository.getActivePromotions(cart.tenantId);
    for (const promo of promotions) {
      // Gate 14: Tenant Isolation Check
      RuntimeGate.assertTenantIsolation(cart.tenantId, promo.tenantId, 'Promotion', promo.id, traceId);
    }

    // 3. Delegate to Pure Calculator
    return PricingCalculator.calculate(cart, coupons, promotions);
  }
}
