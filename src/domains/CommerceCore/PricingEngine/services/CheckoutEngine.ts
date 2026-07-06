import { Money } from '../../Financial/Money';
import { PricingEngine } from './PricingEngine';
import { TaxEngine } from '../../TaxEngine/services/TaxEngine';
import { ComplianceEngine } from '../../Compliance/ComplianceEngine';
import { ShippingStrategy, PricingRule, CartItemContext } from '../contracts/IPricingEngine';

export class CheckoutEngine {
  /**
   * Orchestrates the strict financial pipeline for order checkout.
   * This bridges the HTTP/API world to the pure PricingEngine domain service.
   */
  static async processCheckout(
    currency: string,
    items: CartItemContext[], 
    rules: PricingRule[],
    shippingStrategy: ShippingStrategy,
    context: any
  ): Promise<any> {
    console.log(`[CheckoutEngine] Processing checkout for user ${context.userId}`);
    
    // Check Compliance FIRST before doing math
    const isCompliant = await ComplianceEngine.evaluateCompliance(
      context.buyerCountry, 
      context.sellerCountry || 'US', 
      items[0]?.categoryId || 'GENERAL'
    );
    
    if (!isCompliant) {
      throw new Error('Checkout blocked by Compliance Engine');
    }

    // Initialize Pure Domain Services
    const pricingEngine = new PricingEngine();
    const taxProvider = new TaxEngine(); // Adapts to ITaxProvider

    // Execute core deterministic calculations
    const pricingResult = await pricingEngine.calculateTotals(
      currency,
      items,
      rules,
      shippingStrategy,
      taxProvider,
      context.taxJurisdictionId
    );
    
    // In a real system, we generate the immutable Pricing Snapshot here before persisting.
    console.log(`[CheckoutEngine] Checkout ready: Grand Total ${pricingResult.grandTotal.toString()}`);
    
    return {
      totals: pricingResult,
      snapshot: { timestamp: new Date().toISOString() }
    };
  }
}
