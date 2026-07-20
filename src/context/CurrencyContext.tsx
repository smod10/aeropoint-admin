import React, { createContext, useContext, useEffect, useState } from 'react';

type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR' | 'CAD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convertAndFormat: (amountInNGN: number) => string;
  convertFromAndFormat: (amount: number, fromCurrency: Currency) => string;
}

// Exchange rates relative to 1 NGN as a fallback until live rates are fetched.
const fallbackRates: Record<Currency, number> = {
  NGN: 1,
  USD: 1 / 1500, // Example: 1500 NGN = 1 USD
  GBP: 1 / 1900,
  EUR: 1 / 1620,
  CAD: 1 / 1100,
};

const symbols: Record<Currency, string> = {
  NGN: '₦', USD: '$', GBP: '£', EUR: '€', CAD: 'C$'
};

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [rates, setRates] = useState<Record<Currency, number>>(fallbackRates);

  useEffect(() => {
    const controller = new AbortController();

    const loadLiveRates = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/NGN', { signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        const liveRates = data?.rates;
        if (!liveRates) return;

        setRates({
          NGN: 1,
          USD: Number(liveRates.USD) || fallbackRates.USD,
          GBP: Number(liveRates.GBP) || fallbackRates.GBP,
          EUR: Number(liveRates.EUR) || fallbackRates.EUR,
          CAD: Number(liveRates.CAD) || fallbackRates.CAD,
        });
      } catch {
        // Keep fallback rates when live fetch fails.
      }
    };

    loadLiveRates();
    return () => controller.abort();
  }, []);

  const convertAndFormat = (amountInNGN: number) => {
    const converted = amountInNGN * rates[currency];
    return `${symbols[currency]}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const convertFromAndFormat = (amount: number, fromCurrency: Currency) => {
    const amountInNGN = fromCurrency === 'NGN' ? amount : amount / rates[fromCurrency];
    return convertAndFormat(amountInNGN);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertAndFormat, convertFromAndFormat }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};