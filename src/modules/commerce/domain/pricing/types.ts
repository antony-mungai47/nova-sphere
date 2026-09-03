export interface CartItemPricingInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  tenantId: string; // Required for Gate 14 tenant isolation
  categoryIds?: string[]; // For category-based promotions
}

export interface CartPricingInput {
  items: CartItemPricingInput[];
  tenantId: string;
  currency: string;
}

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface CouponData {
  id: string;
  code: string;
  type: DiscountType;
  discountValue: number;
  minSubtotal?: number;
  maxDiscount?: number;
  tenantId: string; // Gate 14
  isActive: boolean;
  expiresAt?: Date | null;
  maxUses?: number | null;
  currentUses: number;
  version: number;
}

export interface PromotionData {
  id: string;
  type: DiscountType;
  discountValue: number;
  tenantId: string;
  applicableCategoryIds?: string[]; // If empty, applies globally to tenant
  minSubtotal?: number;
  isActive: boolean;
  expiresAt?: Date | null;
}

export interface AppliedDiscount {
  id: string; // coupon code or promotion id
  type: 'COUPON' | 'PROMOTION';
  amount: number;
}

export interface PricingCalculationDTO {
  subtotal: number;
  discountAmount?: number;
  appliedCoupons?: AppliedDiscount[];
  appliedPromotions?: AppliedDiscount[];
  finalPrice?: number;
  currency: string;
  tax?: number;
  shippingCost?: number;
  totalAmount?: number;
  discount?: number;
}
