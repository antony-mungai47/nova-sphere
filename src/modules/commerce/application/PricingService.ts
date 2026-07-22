import { PriceCalculator } from "./pricing/PriceCalculator";
import { PromotionEngine } from "./pricing/PromotionEngine";
import { TaxEngine } from "./pricing/TaxEngine";
import { ShippingCalculator } from "./pricing/ShippingCalculator";
import { PriceValidator } from "./pricing/PriceValidator";

export interface CartItem {
  id: string;
  quantity: number;
  price?: number;
}

export interface PricingBreakdown {
  items: Array<{ productId: string, quantity: number, price: number }>;
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
}

export class PricingService {
  static async calculateTotals(cartItems: CartItem[], clientTotal: number): Promise<PricingBreakdown> {
    const { items, subtotal } = await PriceCalculator.calculateSubtotal(cartItems);
    
    const discountAmount = await PromotionEngine.calculateDiscount(subtotal, clientTotal);
    const tax = TaxEngine.calculateTax(subtotal, discountAmount);
    const shippingCost = ShippingCalculator.calculateShipping(subtotal);
    
    const totalAmount = subtotal - discountAmount + tax + shippingCost;

    const breakdown: PricingBreakdown = {
      items,
      subtotal,
      discount: discountAmount,
      tax,
      shippingCost,
      totalAmount
    };

    PriceValidator.validate(breakdown);

    return breakdown;
  }
}
