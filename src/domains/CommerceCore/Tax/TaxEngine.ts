import { Money } from '../Financial/Money';

export interface ITaxProvider {
  calculateTax(amount: Money, categoryId: string, jurisdictionId: string): Promise<Money>;
}

export class InternalTaxProvider implements ITaxProvider {
  async calculateTax(amount: Money, categoryId: string, jurisdictionId: string): Promise<Money> {
    console.log(`[InternalTaxProvider] Calculating tax for jurisdiction ${jurisdictionId}`);
    // Scaffold: assume 10% tax for everything internally
    return Money.from(amount.amount.mul(0.10), amount.currency);
  }
}

export class TaxEngine {
  private static provider: ITaxProvider = new InternalTaxProvider();

  static async calculateTax(amount: Money, categoryId: string, jurisdictionId: string): Promise<Money> {
    return this.provider.calculateTax(amount, categoryId, jurisdictionId);
  }
}
