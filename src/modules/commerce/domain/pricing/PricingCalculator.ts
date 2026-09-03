import { 
  CartPricingInput, 
  CouponData, 
  PromotionData, 
  PricingCalculationDTO, 
  AppliedDiscount 
} from "./types";

export class PricingCalculator {
  /**
   * Pure deterministic calculation of price breakdown based exclusively on input facts.
   * Zero side effects.
   */
  static calculate(
    cart: CartPricingInput,
    coupons: CouponData[],
    promotions: PromotionData[],
    calculationDate: Date = new Date()
  ): PricingCalculationDTO {
    
    // 1. Calculate base subtotal
    const subtotal = cart.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    let currentPrice = subtotal;
    const appliedCoupons: AppliedDiscount[] = [];
    const appliedPromotions: AppliedDiscount[] = [];

    // 2. Validate & Apply Promotions (Automatically applied)
    for (const promo of promotions) {
      if (!this.isPromoValid(promo, subtotal, calculationDate)) continue;

      // Determine applicable subtotal for this promotion
      const applicableSubtotal = this.getApplicableSubtotal(cart, promo.applicableCategoryIds);
      if (applicableSubtotal <= 0) continue;

      const discountAmount = this.calculateDiscountValue(promo.type, promo.discountValue, applicableSubtotal);
      
      // Ensure we do not discount below zero
      const actualDiscount = Math.min(discountAmount, currentPrice);
      if (actualDiscount > 0) {
        currentPrice -= actualDiscount;
        appliedPromotions.push({ id: promo.id, type: 'PROMOTION', amount: actualDiscount });
      }
    }

    // 3. Validate & Apply Coupons (User applied)
    for (const coupon of coupons) {
      if (!this.isCouponValid(coupon, subtotal, calculationDate)) continue;

      let discountAmount = this.calculateDiscountValue(coupon.type, coupon.discountValue, subtotal);
      
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }

      const actualDiscount = Math.min(discountAmount, currentPrice);
      if (actualDiscount > 0) {
        currentPrice -= actualDiscount;
        appliedCoupons.push({ id: coupon.code, type: 'COUPON', amount: actualDiscount });
      }
    }

    // 4. Ensure non-negative bounds
    const totalDiscountAmount = subtotal - currentPrice;

    return {
      subtotal,
      discountAmount: totalDiscountAmount,
      appliedCoupons,
      appliedPromotions,
      finalPrice: Math.max(0, currentPrice),
      currency: cart.currency
    };
  }

  private static isCouponValid(coupon: CouponData, subtotal: number, now: Date): boolean {
    if (!coupon.isActive) return false;
    if (coupon.expiresAt && coupon.expiresAt < now) return false;
    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return false;
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) return false;
    return true;
  }

  private static isPromoValid(promo: PromotionData, subtotal: number, now: Date): boolean {
    if (!promo.isActive) return false;
    if (promo.expiresAt && promo.expiresAt < now) return false;
    if (promo.minSubtotal && subtotal < promo.minSubtotal) return false;
    return true;
  }

  private static calculateDiscountValue(type: 'PERCENTAGE' | 'FIXED', value: number, applicableTotal: number): number {
    if (value < 0) return 0; // Negative discount protection
    
    if (type === 'PERCENTAGE') {
      return (applicableTotal * value) / 100;
    }
    return value;
  }

  private static getApplicableSubtotal(cart: CartPricingInput, categoryIds?: string[]): number {
    if (!categoryIds || categoryIds.length === 0) {
      // Global promotion
      return cart.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    }
    
    // Category-specific promotion
    return cart.items
      .filter(item => item.categoryIds?.some(id => categoryIds.includes(id)))
      .reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }
}
