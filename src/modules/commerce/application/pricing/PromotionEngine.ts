export class PromotionEngine {
  static async calculateDiscount(subtotal: number, clientTotal: number, couponCode?: string): Promise<number> {
    // In reality, this would lookup the couponCode and calculate the discount based on rules.
    // For now, we use the client-provided difference to simulate coupons.
    const discountAmount = Math.max(0, subtotal - clientTotal);
    return discountAmount;
  }
}
