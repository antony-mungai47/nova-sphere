import { Money } from '../Financial/Money';
import { RegionalPricingEngine } from './RegionalPricingEngine';
import { CurrencyEngine } from '../Currency/CurrencyEngine';

export class PricingEngine {
  /**
   * Computes the final price by checking Regional overrides, then converting currency.
   */
  static async computePrice(productId: string, baseMoney: Money, targetCurrency: string, regionCode: string, fxProvider: any): Promise<Money> {
    // 1. Regional Override (e.g. EU might have a specific fixed EUR price)
    const regionalPrice = await RegionalPricingEngine.getRegionalPrice(productId, baseMoney, regionCode);
    
    // 2. Currency Conversion (If regional price isn't already in the target currency)
    return CurrencyEngine.convert(regionalPrice, targetCurrency, fxProvider);
  }
}
