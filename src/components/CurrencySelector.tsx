import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Currency } from '@/types/crypto';

interface CurrencySelectorProps {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

const currencies: { value: Currency; label: string; symbol: string }[] = [
  { value: 'usd', label: 'US Dollar', symbol: '$' },
  { value: 'eur', label: 'Euro', symbol: '€' },
  { value: 'inr', label: 'Indian Rupee', symbol: '₹' },
  { value: 'btc', label: 'Bitcoin', symbol: '₿' },
  { value: 'eth', label: 'Ethereum', symbol: 'Ξ' },
];

export function CurrencySelector({ currency, onCurrencyChange }: CurrencySelectorProps) {
  const currentCurrency = currencies.find(c => c.value === currency);

  return (
    <Select value={currency} onValueChange={onCurrencyChange}>
      <SelectTrigger className="w-auto glass-card border-0 bg-card/50 backdrop-blur-xl min-w-[120px]">
        <SelectValue>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{currentCurrency?.symbol}</span>
            <span className="hidden sm:inline">{currentCurrency?.label}</span>
            <span className="sm:hidden">{currency.toUpperCase()}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="glass-card border-0 bg-card/95 backdrop-blur-xl">
        {currencies.map((curr) => (
          <SelectItem key={curr.value} value={curr.value}>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{curr.symbol}</span>
              <span>{curr.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}