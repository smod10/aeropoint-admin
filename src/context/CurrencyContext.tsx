import React, { createContext, useContext, useState } from 'react';

// Export the type explicitly
export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR' | 'CAD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convertAndFormat: (amountInNGN: number) => string;
  convertFromAndFormat: (amountInNGN: number, _sourceCurrency?: Currency) => string;
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

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const fallbackContext: CurrencyContextType = {
  currency: 'NGN',
  setCurrency: () => undefined,
  convertAndFormat: (amountInNGN: number) => `₦${amountInNGN.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  convertFromAndFormat: (amountInNGN: number) => `₦${amountInNGN.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  exchangeRates: defaultRates,
  updateExchangeRates: () => undefined,
};

export const CurrencyProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>(defaultRates);

  const convertAndFormat = (amountInNGN: number) => {
    // Math: NGN Amount divided by the foreign currency's NGN equivalent
    const converted = amountInNGN / exchangeRates[currency];
    return `${symbols[currency]}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const convertFromAndFormat = (amountInNGN: number) => convertAndFormat(amountInNGN);

  const updateExchangeRates = (newRates: Record<Currency, number>) => {
    setExchangeRates(newRates);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertAndFormat, convertFromAndFormat, exchangeRates, updateExchangeRates }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  return context ?? fallbackContext;
};