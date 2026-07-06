import { Money } from '../../Financial/Money';
import { ExchangeRateCache } from './ExchangeRateProvider';
import { Decimal } from '@prisma/client/runtime/library';

export class CurrencyEngine {
  /**
   * Converts Money from one currency to another using the cached Exchange Rate
   */
  static async convert(money: Money, targetCurrency: string, provider: any): Promise<Money> {
    if (money.currency === targetCurrency) return money;
    
    const rate = await ExchangeRateCache.getRate(provider, money.currency, targetCurrency);
    const convertedAmount = money.amount.mul(rate);
    
    return Money.from(convertedAmount, targetCurrency);
  }
}
