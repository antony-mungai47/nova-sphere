export class CurrencyEngine {
  // Static map for Phase 13. In production, this would query a Redis cache or real-time API.
  private static readonly EXCHANGE_RATES: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 151.0,
  };

  static convert(amountUsd: number, targetCurrency: string): number {
    const rate = this.EXCHANGE_RATES[targetCurrency.toUpperCase()];
    if (!rate) throw new Error(`Currency ${targetCurrency} not supported`);
    
    return amountUsd * rate;
  }

  static format(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }
}
