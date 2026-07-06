import { Money } from '../../Financial/Money';
import { 
  IPricingEngine, 
  PricingCalculationResult, 
  CartItemContext, 
  PricingRule, 
  ShippingStrategy, 
  ITaxProvider 
} from '../contracts/IPricingEngine';

export class PricingEngine implements IPricingEngine {
  /**
   * Pure Domain Service: Calculates all financial totals for a cart without relying on HTTP, DB, or Framework context.
   */
  async calculateTotals(
    currency: string,
    items: CartItemContext[],
    rules: PricingRule[],
    shippingStrategy: ShippingStrategy,
    taxProvider: ITaxProvider,
    jurisdictionId: string
  ): Promise<PricingCalculationResult> {
    
    // 1. Calculate Base Subtotal
    let subtotal = Money.from(0, currency);
    for (const item of items) {
      const lineTotal = item.unitPrice.multiply(item.quantity);
      subtotal = subtotal.add(lineTotal);
    }

    // 2. Apply Discounts (Pricing Rules)
    let discountTotal = Money.from(0, currency);
    for (const rule of rules) {
      const discount = rule.apply(subtotal, items);
      discountTotal = discountTotal.add(discount);
    }

    // Ensure we don't discount more than the subtotal
    if (discountTotal.isGreaterThan(subtotal)) {
      discountTotal = subtotal;
    }

    const subtotalAfterDiscount = subtotal.subtract(discountTotal);

    // 3. Calculate Shipping
    const shippingTotal = shippingStrategy.calculate(subtotalAfterDiscount, items);

    // 4. Calculate Taxes
    let taxTotal = Money.from(0, currency);
    for (const item of items) {
      // Depending on the jurisdiction, tax might apply to shipping or discounts.
      // For standard eCommerce, we calculate tax on the post-discount price per item.
      // For simplicity in this engine, we aggregate per category.
      const lineTotal = item.unitPrice.multiply(item.quantity);
      
      // Proportion of discount applied to this line item (simple spread)
      let lineDiscount = Money.from(0, currency);
      if (subtotal.amount.greaterThan(0)) {
        const ratio = lineTotal.amount.div(subtotal.amount);
        lineDiscount = Money.from(discountTotal.amount.mul(ratio), currency).round();
      }
      
      const taxableLineAmount = lineTotal.subtract(lineDiscount);
      const lineTax = await taxProvider.calculateTax(taxableLineAmount, item.categoryId, jurisdictionId);
      taxTotal = taxTotal.add(lineTax);
    }

    // 5. Grand Total (Subtotal - Discounts + Shipping + Taxes)
    const grandTotal = subtotalAfterDiscount.add(shippingTotal).add(taxTotal);

    return {
      currency,
      subtotal: subtotal.round(),
      discountTotal: discountTotal.round(),
      shippingTotal: shippingTotal.round(),
      taxTotal: taxTotal.round(),
      grandTotal: grandTotal.round()
    };
  }
}
