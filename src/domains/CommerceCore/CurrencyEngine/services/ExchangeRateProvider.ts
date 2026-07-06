import { Decimal } from '@prisma/client/runtime/library';

export interface ExchangeRateProvider {
  getRate(baseCurrency: string, targetCurrency: string): Promise<Decimal>;
}

export class ExchangeRateCache {
  private static cache: Record<string, { rate: Decimal, expiresAt: number }> = {};

  static async getRate(
    provider: ExchangeRateProvider, 
    baseCurrency: string, 
    targetCurrency: string
  ): Promise<Decimal> {
    const key = `${baseCurrency}_${targetCurrency}`;
    const cached = this.cache[key];
    
    if (cached && cached.expiresAt > Date.now()) {
      return cached.rate;
    }

    const rate = await provider.getRate(baseCurrency, targetCurrency);
    // Cache for 1 hour
    this.cache[key] = { rate, expiresAt: Date.now() + 3600 * 1000 };
    return rate;
  }
}
