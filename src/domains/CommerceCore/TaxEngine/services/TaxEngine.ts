import { Money } from '../../Financial/Money';

import { ITaxProvider } from '../../PricingEngine/contracts/IPricingEngine';

export class TaxEngine implements ITaxProvider {
  async calculateTax(amount: Money, categoryId: string, jurisdictionId: string): Promise<Money> {
    // Scaffold: assume 10% tax for everything internally, or 0% for NO_TAX category
    if (categoryId === 'NO_TAX') return Money.from(0, amount.currency);
    return amount.multiply(0.10);
  }
}
