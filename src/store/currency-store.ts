import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Currency = 'USD' | 'EUR' | 'GBP';

interface CurrencyState {
  currency: Currency;
  exchangeRates: Record<Currency, number>;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInUSD: number) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'USD',
      // Mock exchange rates (1 USD = ...)
      exchangeRates: {
        USD: 1.0,
        EUR: 0.95,
        GBP: 0.82
      },
      setCurrency: (currency) => set({ currency }),
      formatPrice: (priceInUSD) => {
        const { currency, exchangeRates } = get();
        const converted = priceInUSD * exchangeRates[currency];
        
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
          currencyDisplay: 'narrowSymbol'
        }).format(converted);
      }
    }),
    {
      name: 'nova-currency-storage',
    }
  )
);
