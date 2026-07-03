import { Decimal } from '@prisma/client/runtime/library';

export class Money {
  constructor(
    public readonly amount: Decimal,
    public readonly currency: string,
    public readonly precision: number
  ) {}

  /**
   * Factory method to create a Money object safely
   */
  static from(amount: string | number | Decimal, currency: string): Money {
    // Determine precision based on currency code
    const precision = this.getPrecisionForCurrency(currency);
    return new Money(new Decimal(amount), currency, precision);
  }

  static getPrecisionForCurrency(currency: string): number {
    const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND'];
    const threeDecimalCurrencies = ['KWD', 'BHD', 'OMR'];
    
    if (zeroDecimalCurrencies.includes(currency.toUpperCase())) return 0;
    if (threeDecimalCurrencies.includes(currency.toUpperCase())) return 3;
    return 2; // Default for USD, EUR, GBP, etc.
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(this.precision)}`;
  }
}
