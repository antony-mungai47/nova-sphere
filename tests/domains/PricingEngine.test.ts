// @ts-nocheck
import { PricingEngine } from '@/domains/CommerceCore/PricingEngine/services/PricingEngine';
import { Money } from '@/domains/CommerceCore/Financial/Money';
import { ITaxProvider, PricingRule, ShippingStrategy } from '@/domains/CommerceCore/PricingEngine/contracts/IPricingEngine';

describe('PricingEngine', () => {
  let engine: PricingEngine;

  beforeEach(() => {
    engine = new PricingEngine();
  });

  describe('calculateTotals', () => {
    it('calculates correct totals without discounts or shipping', async () => {
      const taxProvider: ITaxProvider = {
        calculateTax: jest.fn().mockResolvedValue(Money.from(5, 'USD'))
      };
      
      const shippingStrategy: ShippingStrategy = {
        calculate: jest.fn().mockReturnValue(Money.from(0, 'USD'))
      };

      const result = await engine.calculateTotals(
        'USD',
        [
          { id: 'P1', quantity: 2, unitPrice: Money.from(10, 'USD') },
          { id: 'P2', quantity: 1, unitPrice: Money.from(5, 'USD') }
        ],
        [],
        shippingStrategy,
        taxProvider,
        'US-NY'
      );

      expect(result.subtotal.amount.toNumber()).toBe(25);
      expect(result.discountTotal.amount.toNumber()).toBe(0);
      expect(result.shippingTotal.amount.toNumber()).toBe(0);
      expect(result.taxTotal.amount.toNumber()).toBe(10);
      expect(result.grandTotal.amount.toNumber()).toBe(35);
    });

    it('caps discount total to subtotal if discounts exceed subtotal', async () => {
      const taxProvider: ITaxProvider = {
        calculateTax: jest.fn().mockResolvedValue(Money.from(0, 'USD'))
      };
      const shippingStrategy: ShippingStrategy = {
        calculate: jest.fn().mockReturnValue(Money.from(0, 'USD'))
      };

      const excessiveDiscountRule: PricingRule = {
        apply: () => Money.from(100, 'USD')
      };

      const result = await engine.calculateTotals(
        'USD',
        [{ id: 'P1', quantity: 1, unitPrice: Money.from(10, 'USD') }],
        [excessiveDiscountRule],
        shippingStrategy,
        taxProvider,
        'US-NY'
      );

      expect(result.subtotal.amount.toNumber()).toBe(10);
      expect(result.discountTotal.amount.toNumber()).toBe(10); // Capped to subtotal
      expect(result.grandTotal.amount.toNumber()).toBe(0);
    });

    it('calculates correct totals with shipping and tax on the discounted amount', async () => {
      const taxProvider: ITaxProvider = {
        calculateTax: jest.fn().mockResolvedValue(Money.from(2, 'USD'))
      };
      const shippingStrategy: ShippingStrategy = {
        calculate: jest.fn().mockReturnValue(Money.from(10, 'USD'))
      };
      const tenOffRule: PricingRule = {
        id: "rule1", name: "test rule", apply: () => Money.from(10, "USD")
      };

      const result = await engine.calculateTotals(
        'USD',
        [{ id: 'P1', quantity: 1, unitPrice: Money.from(50, 'USD') }],
        [tenOffRule],
        shippingStrategy,
        taxProvider,
        'US-NY'
      );

      // Subtotal: 50
      // Discount: 10
      // SubtotalAfterDiscount: 40
      // Shipping: 10
      // Taxable: 50
      // Tax: 2
      // Grand: 40 + 10 + 2 = 52
      expect(result.subtotal.amount.toNumber()).toBe(50);
      expect(result.discountTotal.amount.toNumber()).toBe(10);
      expect(result.shippingTotal.amount.toNumber()).toBe(10);
      expect(result.taxTotal.amount.toNumber()).toBe(2);
      expect(result.grandTotal.amount.toNumber()).toBe(52);
    });
  });
});
