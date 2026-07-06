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

  // Mathematics (Always returns a new instance, prevents mutation)
  
  private ensureSameCurrency(other: Money) {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch: Cannot operate on ${this.currency} and ${other.currency}`);
    }
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount.plus(other.amount), this.currency, this.precision);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount.minus(other.amount), this.currency, this.precision);
  }

  multiply(multiplier: number | Decimal): Money {
    return new Money(this.amount.mul(multiplier), this.currency, this.precision);
  }

  isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount.greaterThan(other.amount);
  }

  isGreaterThanOrEqualTo(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount.greaterThanOrEqualTo(other.amount);
  }

  // To prevent precision leaks when serializing or completing a calculation
  round(): Money {
    // Decimal.js rounding modes: Decimal.ROUND_HALF_UP (4) is standard for currency
    const rounded = this.amount.toDecimalPlaces(this.precision, 4 as any); 
    return new Money(rounded, this.currency, this.precision);
  }
}
