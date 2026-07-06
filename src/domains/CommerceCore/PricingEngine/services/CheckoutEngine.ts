import { Money } from '../../Financial/Money';
import { PricingEngine } from './PricingEngine';
import { TaxEngine } from '../../TaxEngine/services/TaxEngine';
import { ComplianceEngine } from '../../Compliance/ComplianceEngine';
// PromotionEngine, CurrencyEngine, etc.

export class CheckoutEngine {
  /**
   * Orchestrates the strict financial pipeline for order checkout.
   */
  static async processCheckout(cart: any, context: any, fxProvider: any): Promise<any> {
    console.log(`[CheckoutEngine] Processing checkout for user ${context.userId}`);

    let orderBaseTotal = Money.from(0, 'USD');
    let orderDisplayTotal = Money.from(0, context.displayCurrency);
    
    // Check Compliance FIRST before doing math
    const isCompliant = await ComplianceEngine.evaluateCompliance(
      context.buyerCountry, 
      cart.sellerCountry, 
      cart.items[0]?.category || 'GENERAL'
    );
    if (!isCompliant) {
      throw new Error('Checkout blocked by Compliance Engine');
    }

    for (const item of cart.items) {
      // 1. Pricing Engine (Base price + Regional Overrides)
      const basePrice = await PricingEngine.computePrice(item.productId, Money.from(item.basePrice, 'USD'), 'USD', context.region, fxProvider);
      
      // 2. Promotion Engine (Skipped scaffold)
      const priceAfterPromos = basePrice;
      
      // 3. Currency Engine (Convert to display)
      const displayPrice = await PricingEngine.computePrice(item.productId, priceAfterPromos, context.displayCurrency, context.region, fxProvider);
      
      // 4. Tax Engine
      const taxAmount = await TaxEngine.calculateTax(displayPrice, item.categoryId, context.taxJurisdictionId);
      
      // 5. Aggregate
      orderBaseTotal = Money.from(orderBaseTotal.amount.plus(basePrice.amount), 'USD');
      orderDisplayTotal = Money.from(orderDisplayTotal.amount.plus(displayPrice.amount).plus(taxAmount.amount), context.displayCurrency);
    }
    
    // In a real system, we generate the immutable Pricing Snapshot here before persisting.
    console.log(`[CheckoutEngine] Checkout ready: Base ${orderBaseTotal.toString()}, Display ${orderDisplayTotal.toString()}`);
    
    return {
      baseTotal: orderBaseTotal,
      displayTotal: orderDisplayTotal,
      snapshot: { timestamp: new Date().toISOString() }
    };
  }
}
