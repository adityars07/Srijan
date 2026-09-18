import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Currency, Product } from '../types';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  formatPrice: (amountINR: number, amountUSD?: number) => string;
  formatProductPrice: (product: Product) => string;
  formatProductOriginalPrice: (product: Product) => string | null;
  getRawPrice: (amountINR: number, amountUSD?: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('INR');

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'INR' ? 'USD' : 'INR'));
  };

  const formatPrice = (amountINR: number, amountUSD?: number): string => {
    if (currency === 'INR') {
      return `₹${amountINR.toLocaleString('en-IN')}`;
    }
    const usd = amountUSD ?? Math.round(amountINR / 83);
    return `${usd} USD`;
  };

  const formatProductPrice = (product: Product): string => {
    return formatPrice(product.priceINR, product.priceUSD);
  };

  const formatProductOriginalPrice = (product: Product): string | null => {
    if (currency === 'INR' && product.originalPriceINR) {
      return `₹${product.originalPriceINR.toLocaleString('en-IN')}`;
    }
    if (currency === 'USD' && product.originalPriceUSD) {
      return `${product.originalPriceUSD} USD`;
    }
    return null;
  };

  const getRawPrice = (amountINR: number, amountUSD?: number): number => {
    if (currency === 'INR') {
      return amountINR;
    }
    return amountUSD ?? Math.round(amountINR / 83);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        formatPrice,
        formatProductPrice,
        formatProductOriginalPrice,
        getRawPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
