import { Money } from '../../Financial/Money';

export interface CartItemContext {
  id: string;
  unitPrice: Money;
  quantity: number;
  categoryId: string;
}

export interface PricingRule {
  id: string;
  name: string;
  apply(subtotal: Money, items: CartItemContext[]): Money;
}

export interface ShippingStrategy {
  calculate(cartSubtotalAfterDiscount: Money, items: CartItemContext[], address?: any): Money;
}

export interface ITaxProvider {
  calculateTax(amount: Money, categoryId: string, jurisdictionId: string): Promise<Money>;
}

export interface PricingCalculationResult {
  currency: string;
  subtotal: Money;
  discountTotal: Money;
  shippingTotal: Money;
  taxTotal: Money;
  grandTotal: Money;
}

export interface IPricingEngine {
  calculateTotals(
    currency: string,
    items: CartItemContext[],
    rules: PricingRule[],
    shippingStrategy: ShippingStrategy,
    taxProvider: ITaxProvider,
    jurisdictionId: string
  ): Promise<PricingCalculationResult>;
}
