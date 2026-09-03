import { PricingCalculator } from "./PricingCalculator";
import { CartPricingInput, CouponData, PromotionData } from "./types";

describe("PricingCalculator (Pure Domain Logic)", () => {
  const baseDate = new Date("2026-08-10T12:00:00Z");
  
  const createCart = (price: number, quantity: number, categoryIds: string[] = []): CartPricingInput => ({
    tenantId: "tenant-a",
    currency: "USD",
    items: [{ productId: "p1", unitPrice: price, quantity, tenantId: "tenant-a", categoryIds }]
  });

  const createCoupon = (overrides: Partial<CouponData> = {}): CouponData => ({
    id: "c1",
    code: "TEST10",
    type: "PERCENTAGE",
    discountValue: 10,
    tenantId: "tenant-a",
    isActive: true,
    currentUses: 0,
    version: 1,
    ...overrides
  });

  it("calculates subtotal correctly with no coupons or promotions", () => {
    const cart = createCart(50, 2);
    const result = PricingCalculator.calculate(cart, [], [], baseDate);
    expect(result.subtotal).toBe(100);
    expect(result.discountAmount).toBe(0);
    expect(result.finalPrice).toBe(100);
  });

  it("applies a percentage coupon correctly", () => {
    const cart = createCart(50, 2);
    const coupon = createCoupon({ type: "PERCENTAGE", discountValue: 20 });
    const result = PricingCalculator.calculate(cart, [coupon], [], baseDate);
    expect(result.discountAmount).toBe(20);
    expect(result.finalPrice).toBe(80);
    expect(result.appliedCoupons).toHaveLength(1);
  });

  it("applies a fixed coupon correctly", () => {
    const cart = createCart(50, 2);
    const coupon = createCoupon({ type: "FIXED", discountValue: 25 });
    const result = PricingCalculator.calculate(cart, [coupon], [], baseDate);
    expect(result.discountAmount).toBe(25);
    expect(result.finalPrice).toBe(75);
  });

  it("caps discount at current subtotal (no negative final price)", () => {
    const cart = createCart(10, 1); // subtotal 10
    const coupon = createCoupon({ type: "FIXED", discountValue: 50 });
    const result = PricingCalculator.calculate(cart, [coupon], [], baseDate);
    expect(result.discountAmount).toBe(10);
    expect(result.finalPrice).toBe(0); // Cannot be -40
  });

  it("rejects expired coupons", () => {
    const cart = createCart(100, 1);
    const expiredDate = new Date(baseDate.getTime() - 10000);
    const coupon = createCoupon({ expiresAt: expiredDate });
    const result = PricingCalculator.calculate(cart, [coupon], [], baseDate);
    expect(result.discountAmount).toBe(0);
    expect(result.finalPrice).toBe(100);
    expect(result.appliedCoupons).toHaveLength(0);
  });

  it("rejects inactive coupons", () => {
    const cart = createCart(100, 1);
    const coupon = createCoupon({ isActive: false });
    const result = PricingCalculator.calculate(cart, [coupon], [], baseDate);
    expect(result.discountAmount).toBe(0);
  });

  it("rejects coupons based on minSubtotal", () => {
    const cart = createCart(50, 1);
    const coupon = createCoupon({ minSubtotal: 100 });
    const result = PricingCalculator.calculate(cart, [coupon], [], baseDate);
    expect(result.discountAmount).toBe(0);
  });

  it("rejects coupons that exceed max usage", () => {
    const cart = createCart(100, 1);
    const coupon = createCoupon({ maxUses: 5, currentUses: 5 });
    const result = PricingCalculator.calculate(cart, [coupon], [], baseDate);
    expect(result.discountAmount).toBe(0);
  });

  it("applies maxDiscount cap correctly for percentage coupons", () => {
    const cart = createCart(1000, 1); // 1000
    // 50% off, max discount $100
    const coupon = createCoupon({ type: "PERCENTAGE", discountValue: 50, maxDiscount: 100 });
    const result = PricingCalculator.calculate(cart, [coupon], [], baseDate);
    expect(result.discountAmount).toBe(100); // capped at 100, not 500
    expect(result.finalPrice).toBe(900);
  });

  it("applies category-specific promotions", () => {
    const cart: CartPricingInput = {
      tenantId: "tenant-a",
      currency: "USD",
      items: [
        { productId: "p1", unitPrice: 50, quantity: 1, tenantId: "tenant-a", categoryIds: ["cat-1"] }, // applicable
        { productId: "p2", unitPrice: 150, quantity: 1, tenantId: "tenant-a", categoryIds: ["cat-2"] } // not applicable
      ]
    };

    const promo: PromotionData = {
      id: "promo-1",
      type: "PERCENTAGE",
      discountValue: 10, // 10% off
      tenantId: "tenant-a",
      isActive: true,
      applicableCategoryIds: ["cat-1"]
    };

    const result = PricingCalculator.calculate(cart, [], [promo], baseDate);
    // Subtotal = 200
    // Applicable = 50 -> 10% of 50 = 5
    expect(result.subtotal).toBe(200);
    expect(result.discountAmount).toBe(5);
    expect(result.finalPrice).toBe(195);
  });

  it("protects against negative discount values", () => {
    const cart = createCart(100, 1);
    const coupon = createCoupon({ type: "FIXED", discountValue: -50 });
    const result = PricingCalculator.calculate(cart, [coupon], [], baseDate);
    expect(result.discountAmount).toBe(0);
    expect(result.finalPrice).toBe(100);
  });

  it("combines promotions and coupons correctly", () => {
    const cart = createCart(100, 1);
    const promo: PromotionData = {
      id: "promo-1",
      type: "FIXED",
      discountValue: 20,
      tenantId: "tenant-a",
      isActive: true,
    };
    const coupon = createCoupon({ type: "PERCENTAGE", discountValue: 10 }); // 10% off remainder

    const result = PricingCalculator.calculate(cart, [coupon], [promo], baseDate);
    // Promo applied first: 100 - 20 = 80
    // Coupon applied second: 10% of 100? No, wait! Coupon calculates off base subtotal in our logic!
    // Let's check our logic: `this.calculateDiscountValue(coupon.type, coupon.discountValue, subtotal);`
    // Yes, 10% of 100 = 10.
    // So Promo (20) + Coupon (10) = 30 total discount.
    expect(result.discountAmount).toBe(30);
    expect(result.finalPrice).toBe(70);
  });
});
