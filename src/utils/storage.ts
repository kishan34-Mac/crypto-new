import type { Currency } from '@/types/crypto';

const STORAGE_KEYS = {
  WATCHLIST: 'crypto-watchlist',
  CURRENCY: 'crypto-currency',
  THEME: 'crypto-theme',
} as const;

export class StorageManager {
  // Watchlist management
  static getWatchlist(): string[] {
    try {
      const watchlist = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      return watchlist ? JSON.parse(watchlist) : [];
    } catch {
      return [];
    }
  }

  static addToWatchlist(coinId: string): void {
    const watchlist = this.getWatchlist();
    if (!watchlist.includes(coinId)) {
      watchlist.push(coinId);
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
    }
  }

  static removeFromWatchlist(coinId: string): void {
    const watchlist = this.getWatchlist();
    const updatedList = watchlist.filter(id => id !== coinId);
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(updatedList));
  }

  static isInWatchlist(coinId: string): boolean {
    return this.getWatchlist().includes(coinId);
  }

  // Currency management
  static getCurrency(): Currency {
    try {
      const currency = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      return (currency as Currency) || 'usd';
    } catch {
      return 'usd';
    }
  }

  static setCurrency(currency: Currency): void {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  }

  // Theme management
  static getTheme(): 'light' | 'dark' {
    try {
      const theme = localStorage.getItem(STORAGE_KEYS.THEME);
      return (theme as 'light' | 'dark') || 'dark';
    } catch {
      return 'dark';
    }
  }

  static setTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.classList.toggle('light', theme === 'light');
  }
}

// Currency formatting utilities
export const formatCurrency = (amount: number, currency: Currency): string => {
  const currencySymbols: Record<Currency, string> = {
    usd: '$',
    eur: '€',
    inr: '₹',
    btc: '₿',
    eth: 'Ξ',
  };

  if (currency === 'btc' || currency === 'eth') {
    return `${currencySymbols[currency]}${amount.toFixed(8)}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: amount < 1 ? 4 : 2,
    maximumFractionDigits: amount < 1 ? 6 : 2,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
};

export const formatPercentage = (percentage: number): string => {
  const sign = percentage > 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
};