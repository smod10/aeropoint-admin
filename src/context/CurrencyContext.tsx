import React, { createContext, useContext, useState } from 'react';

// Export the type explicitly
export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR' | 'CAD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convertAndFormat: (amountInNGN: number) => string;
  convertFromAndFormat: (amountInNGN: number, _sourceCurrency?: Currency) => string;
  convertToNGNAndFormat: (amount: number, sourceCurrency: string) => string;
  exchangeRates: Record<Currency, number>;
  updateExchangeRates: (newRates: Record<Currency, number>) => void;
}

// Base values: 1 Unit of Foreign Currency = X NGN
const defaultRates: Record<Currency, number> = {
  NGN: 1,
  USD: 1500, 
  GBP: 1900,
  EUR: 1620,
  CAD: 1100,
};

const symbols: Record<Currency, string> = {
  NGN: '₦', USD: '$', GBP: '£', EUR: '€', CAD: 'C$'
};

const isCurrency = (value: string | null): value is Currency =>
  value !== null && Object.hasOwn(defaultRates, value);

const getInitialCurrency = (): Currency => {
  if (typeof window === 'undefined') return 'NGN';
  const storedCurrency = localStorage.getItem('aeropoint-base-currency');
  return isCurrency(storedCurrency) ? storedCurrency : 'NGN';
};

const getInitialExchangeRates = (): Record<Currency, number> => {
  if (typeof window === 'undefined') return defaultRates;
  try {
    const stored = JSON.parse(localStorage.getItem('aeropoint-exchange-rates') || '{}') as Partial<Record<Currency, unknown>>;
    return (Object.keys(defaultRates) as Currency[]).reduce((rates, code) => {
      const value = Number(stored[code]);
      rates[code] = Number.isFinite(value) && value > 0 ? value : defaultRates[code];
      return rates;
    }, { ...defaultRates });
  } catch {
    return defaultRates;
  }
};

const formatNGN = (amount: number) => `₦${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const fallbackContext: CurrencyContextType = {
  currency: 'NGN',
  setCurrency: () => undefined,
  convertAndFormat: (amountInNGN: number) => `₦${amountInNGN.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  convertFromAndFormat: (amount: number, sourceCurrency: Currency = 'NGN') => `₦${(amount * defaultRates[sourceCurrency]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  convertToNGNAndFormat: (amount: number, sourceCurrency: string) => isCurrency(sourceCurrency) ? formatNGN(amount * defaultRates[sourceCurrency]) : `Rate unavailable (${sourceCurrency || 'source currency not provided'})`,
  exchangeRates: defaultRates,
  updateExchangeRates: () => undefined,
};

export const CurrencyProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(getInitialCurrency);
  const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>(getInitialExchangeRates);

  const convertAndFormat = (amountInNGN: number) => {
    // Math: NGN Amount divided by the foreign currency's NGN equivalent
    const converted = amountInNGN / exchangeRates[currency];
    return `${symbols[currency]}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const setCurrency = (nextCurrency: Currency) => {
    setCurrencyState(nextCurrency);
    localStorage.setItem('aeropoint-base-currency', nextCurrency);
  };

  const convertFromAndFormat = (amount: number, sourceCurrency: Currency = 'NGN') =>
    convertAndFormat(amount * exchangeRates[sourceCurrency]);

  const convertToNGNAndFormat = (amount: number, sourceCurrency: string) => {
    if (!isCurrency(sourceCurrency)) return `Rate unavailable (${sourceCurrency || 'source currency not provided'})`;
    const rate = exchangeRates[sourceCurrency];
    if (!Number.isFinite(rate) || rate <= 0) return `Rate unavailable (${sourceCurrency})`;
    return convertAndFormat(amount * rate);
  };

  const updateExchangeRates = (newRates: Record<Currency, number>) => {
    setExchangeRates(newRates);
    localStorage.setItem('aeropoint-exchange-rates', JSON.stringify(newRates));
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertAndFormat, convertFromAndFormat, convertToNGNAndFormat, exchangeRates, updateExchangeRates }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  return context ?? fallbackContext;
};