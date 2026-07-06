import { PricingEngine } from '../../src/domains/CommerceCore/PricingEngine/services/PricingEngine';
import { Money } from '../../src/domains/CommerceCore/Financial/Money';
import { CartItemContext, PricingRule, ShippingStrategy } from '../../src/domains/CommerceCore/PricingEngine/contracts/IPricingEngine';
import { TaxEngine } from '../../src/domains/CommerceCore/TaxEngine/services/TaxEngine';

class FlatDiscountRule implements PricingRule {
  id = 'FLAT10';
  name = 'Flat $10 Off';
  constructor(private discountAmount: number) {}
  apply(subtotal: Money, items: CartItemContext[]): Money {
    return Money.from(this.discountAmount, subtotal.currency);
  }
}

class PercentageDiscountRule implements PricingRule {
  id = 'PCT20';
  name = '20% Off';
  constructor(private pct: number) {}
  apply(subtotal: Money, items: CartItemContext[]): Money {
    return subtotal.multiply(this.pct).round();
  }
}

class FlatShippingStrategy implements ShippingStrategy {
  constructor(private cost: number) {}
  calculate(cartSubtotalAfterDiscount: Money, items: CartItemContext[], address?: any): Money {
    return Money.from(this.cost, cartSubtotalAfterDiscount.currency);
  }
}

class ThresholdFreeShippingStrategy implements ShippingStrategy {
  constructor(private threshold: number, private standardCost: number) {}
  calculate(cartSubtotalAfterDiscount: Money, items: CartItemContext[], address?: any): Money {
    if (cartSubtotalAfterDiscount.amount.greaterThanOrEqualTo(this.threshold)) {
      return Money.from(0, cartSubtotalAfterDiscount.currency);
    }
    return Money.from(this.standardCost, cartSubtotalAfterDiscount.currency);
  }
}

describe('PricingEngine', () => {
  let engine: PricingEngine;
  let taxProvider: TaxEngine;

  beforeEach(() => {
    engine = new PricingEngine();
    taxProvider = new TaxEngine();
  });

  const createItem = (id: string, price: number, qty: number, category: string = 'GENERAL', currency: string = 'USD'): CartItemContext => ({
    id,
    unitPrice: Money.from(price, currency),
    quantity: qty,
    categoryId: category
  });

  it('calculates base subtotal and tax correctly', async () => {
    const items = [
      createItem('item1', 10.00, 2), // $20
      createItem('item2', 5.00, 1)   // $5
    ];
    // Subtotal: 25.00
    // Tax (10%): 2.50
    // Shipping: 5.00
    // Grand Total: 32.50
    const result = await engine.calculateTotals(
      'USD', items, [], new FlatShippingStrategy(5), taxProvider, 'US-CA'
    );

    expect(result.subtotal.amount.toNumber()).toBe(25);
    expect(result.taxTotal.amount.toNumber()).toBe(2.50);
    expect(result.shippingTotal.amount.toNumber()).toBe(5);
    expect(result.grandTotal.amount.toNumber()).toBe(32.50);
  });

  it('handles empty cart (0 items)', async () => {
    const result = await engine.calculateTotals(
      'USD', [], [], new FlatShippingStrategy(5), taxProvider, 'US-CA'
    );
    expect(result.subtotal.amount.toNumber()).toBe(0);
    expect(result.taxTotal.amount.toNumber()).toBe(0);
    expect(result.shippingTotal.amount.toNumber()).toBe(5); // Shipping still applies
    expect(result.grandTotal.amount.toNumber()).toBe(5);
  });

  it('handles large cart (100 items)', async () => {
    const items = Array.from({ length: 100 }).map((_, i) => createItem(`item${i}`, 9.99, 1));
    // Subtotal: 999.00
    // Tax (10%): 99.90
    // Shipping: 0 (free over 100)
    // Grand Total: 1098.90
    const result = await engine.calculateTotals(
      'USD', items, [], new ThresholdFreeShippingStrategy(100, 10), taxProvider, 'US-CA'
    );
    expect(result.subtotal.amount.toNumber()).toBe(999);
    expect(result.taxTotal.amount.toNumber()).toBe(99.90);
    expect(result.shippingTotal.amount.toNumber()).toBe(0);
    expect(result.grandTotal.amount.toNumber()).toBe(1098.90);
  });

  it('applies discounts correctly and spreads tax deduction', async () => {
    const items = [createItem('item1', 100.00, 1)];
    const rule = new FlatDiscountRule(20); // $20 off
    // Subtotal: 100.00
    // Discount: -20.00 -> 80.00
    // Tax on 80: 8.00
    // Shipping: 5.00
    // Grand Total: 93.00
    const result = await engine.calculateTotals(
      'USD', items, [rule], new FlatShippingStrategy(5), taxProvider, 'US-CA'
    );

    expect(result.discountTotal.amount.toNumber()).toBe(20);
    expect(result.subtotal.amount.toNumber()).toBe(100);
    expect(result.taxTotal.amount.toNumber()).toBe(8);
    expect(result.grandTotal.amount.toNumber()).toBe(93);
  });

  it('prevents discounts from exceeding subtotal', async () => {
    const items = [createItem('item1', 10.00, 1)];
    const rule = new FlatDiscountRule(20); // $20 off a $10 item
    
    const result = await engine.calculateTotals(
      'USD', items, [rule], new FlatShippingStrategy(0), taxProvider, 'US-CA'
    );

    expect(result.discountTotal.amount.toNumber()).toBe(10); // Capped at subtotal
    expect(result.grandTotal.amount.toNumber()).toBe(0); // Free
  });

  it('handles threshold free shipping edge cases (99.99 vs 100.01)', async () => {
    const strategy = new ThresholdFreeShippingStrategy(100, 15);
    
    // 99.99
    const res1 = await engine.calculateTotals('USD', [createItem('i1', 99.99, 1)], [], strategy, taxProvider, 'US-CA');
    expect(res1.shippingTotal.amount.toNumber()).toBe(15);
    
    // 100.01
    const res2 = await engine.calculateTotals('USD', [createItem('i2', 100.01, 1)], [], strategy, taxProvider, 'US-CA');
    expect(res2.shippingTotal.amount.toNumber()).toBe(0);
  });

  it('handles currency rounding precision (JPY)', async () => {
    // JPY has no decimal places (0 precision). 
    // Subtotal: 1005 JPY
    // 10% tax = 100.5 -> should round to 101 JPY
    const items = [createItem('item1', 1005, 1, 'GENERAL', 'JPY')];
    const result = await engine.calculateTotals(
      'JPY', items, [], new FlatShippingStrategy(500), taxProvider, 'JP'
    );

    expect(result.taxTotal.amount.toNumber()).toBe(101); // 100.5 rounded up
    expect(result.grandTotal.amount.toNumber()).toBe(1005 + 101 + 500); // 1606
  });

  it('handles floating point decimal edge cases safely', async () => {
    // 0.1 + 0.2 normally equals 0.30000000000000004 in JS floats
    const items = [
      createItem('item1', 0.10, 1),
      createItem('item2', 0.20, 1)
    ];
    const result = await engine.calculateTotals(
      'USD', items, [], new FlatShippingStrategy(0), taxProvider, 'US-CA'
    );
    expect(result.subtotal.amount.toNumber()).toBe(0.30);
  });
});
