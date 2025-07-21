import type { CryptoCurrency, CoinDetail, PriceHistory, Currency, TimeRange } from '@/types/crypto';

const BASE_URL = 'https://api.coingecko.com/api/v3';

class CryptoApiService {
  private async fetchWithRetry<T>(url: string, retries = 3): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    throw new Error('Max retries exceeded');
  }

  async getCoins(currency: Currency = 'usd', perPage = 100, page = 1): Promise<CryptoCurrency[]> {
    const url = `${BASE_URL}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h,7d`;
    return this.fetchWithRetry<CryptoCurrency[]>(url);
  }

  async getCoinDetail(coinId: string, currency: Currency = 'usd'): Promise<CoinDetail> {
    const url = `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`;
    return this.fetchWithRetry<CoinDetail>(url);
  }

  async getCoinHistory(coinId: string, currency: Currency = 'usd', days: TimeRange = '7'): Promise<PriceHistory> {
    const url = `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}&interval=${days === '1' ? 'hourly' : 'daily'}`;
    return this.fetchWithRetry<PriceHistory>(url);
  }

  async searchCoins(query: string): Promise<{ coins: { id: string; name: string; symbol: string; thumb: string }[] }> {
    const url = `${BASE_URL}/search?query=${encodeURIComponent(query)}`;
    return this.fetchWithRetry<{ coins: { id: string; name: string; symbol: string; thumb: string }[] }>(url);
  }

  async getTrendingCoins(): Promise<{ coins: { item: { id: string; name: string; symbol: string; thumb: string; market_cap_rank: number } }[] }> {
    const url = `${BASE_URL}/search/trending`;
    return this.fetchWithRetry<{ coins: { item: { id: string; name: string; symbol: string; thumb: string; market_cap_rank: number } }[] }>(url);
  }

  async getGlobalData(): Promise<{
    data: {
      active_cryptocurrencies: number;
      total_market_cap: { [key: string]: number };
      total_volume: { [key: string]: number };
      market_cap_percentage: { [key: string]: number };
      market_cap_change_percentage_24h_usd: number;
    }
  }> {
    const url = `${BASE_URL}/global`;
    return this.fetchWithRetry<{
      data: {
        active_cryptocurrencies: number;
        total_market_cap: { [key: string]: number };
        total_volume: { [key: string]: number };
        market_cap_percentage: { [key: string]: number };
        market_cap_change_percentage_24h_usd: number;
      }
    }>(url);
  }
}

export const cryptoApi = new CryptoApiService();