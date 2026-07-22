import { PricingBreakdown } from "../PricingService";

export class PriceValidator {
  static validate(breakdown: PricingBreakdown): void {
    if (breakdown.subtotal < 0) {
      throw new Error("Subtotal cannot be negative");
    }
    if (breakdown.discount < 0) {
      throw new Error("Discount cannot be negative");
    }
    if (breakdown.discount > breakdown.subtotal) {
      throw new Error("Discount cannot exceed subtotal");
    }
    if (breakdown.tax < 0) {
      throw new Error("Tax cannot be negative");
    }
    if (breakdown.shippingCost < 0) {
      throw new Error("Shipping cost cannot be negative");
    }

    const calculatedTotal = breakdown.subtotal - breakdown.discount + breakdown.tax + breakdown.shippingCost;
    
    // Allow small floating point variances
    if (Math.abs(calculatedTotal - breakdown.totalAmount) > 0.01) {
      throw new Error(`Pricing consistency error. Expected ${calculatedTotal}, got ${breakdown.totalAmount}`);
    }
    if (breakdown.totalAmount < 0) {
      throw new Error("Total amount cannot be negative");
    }
  }
}
