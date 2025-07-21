import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Star, Filter, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CryptoCard } from './CryptoCard';
import { SearchBar } from './SearchBar';
import { CurrencySelector } from './CurrencySelector';
import { ThemeToggle } from './ThemeToggle';
import { cryptoApi } from '@/services/cryptoApi';
import { StorageManager, formatCurrency } from '@/utils/storage';
import type { CryptoCurrency, Currency } from '@/types/crypto';

export function CryptoTracker() {
  const [coins, setCoins] = useState<CryptoCurrency[]>([]);
  const [watchlistCoins, setWatchlistCoins] = useState<CryptoCurrency[]>([]);
  const [currency, setCurrency] = useState<Currency>(StorageManager.getCurrency());
  const [theme, setTheme] = useState<'light' | 'dark'>(StorageManager.getTheme());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CryptoCurrency | null>(null);
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadCoins();
    loadWatchlistCoins();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadCoins(false);
      loadWatchlistCoins(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [currency]);

  // Initialize theme
  useEffect(() => {
    StorageManager.setTheme(theme);
  }, [theme]);

  const loadCoins = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await cryptoApi.getCoins(currency, 50);
      setCoins(data);
    } catch (error) {
      console.error('Failed to load coins:', error);
      toast({
        title: "Error",
        description: "Failed to load cryptocurrency data. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const loadWatchlistCoins = async (showLoading = false) => {
    const watchlist = StorageManager.getWatchlist();
    if (watchlist.length === 0) {
      setWatchlistCoins([]);
      return;
    }

    try {
      // Get watchlist coins data
      const watchlistData = await Promise.all(
        watchlist.map(async (coinId) => {
          try {
            const coinData = await cryptoApi.getCoins(currency, 250);
            return coinData.find(coin => coin.id === coinId);
          } catch (error) {
            console.error(`Failed to load coin ${coinId}:`, error);
            return null;
          }
        })
      );
      
      const validCoins = watchlistData.filter((coin): coin is CryptoCurrency => coin !== null);
      setWatchlistCoins(validCoins);
    } catch (error) {
      console.error('Failed to load watchlist:', error);
    }
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    StorageManager.setCurrency(newCurrency);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    StorageManager.setTheme(newTheme);
  };

  const handleToggleWatchlist = (coinId: string) => {
    const isWatched = StorageManager.isInWatchlist(coinId);
    const coinName = coins.find(c => c.id === coinId)?.name || coinId;
    
    if (isWatched) {
      StorageManager.removeFromWatchlist(coinId);
      toast({
        title: "Removed from Watchlist",
        description: `${coinName} has been removed from your watchlist.`,
      });
    } else {
      StorageManager.addToWatchlist(coinId);
      toast({
        title: "Added to Watchlist",
        description: `${coinName} has been added to your watchlist.`,
      });
    }
    
    // Reload watchlist
    loadWatchlistCoins();
  };

  const handleSelectCoin = (coinId: string) => {
    const coin = coins.find(c => c.id === coinId);
    if (coin) {
      setSelectedCoin(coin);
      // Open coin's website
      window.open(`https://www.coingecko.com/en/coins/${coinId}`, '_blank');
    }
  };

  const handleCoinClick = (coin: CryptoCurrency) => {
    setSelectedCoin(coin);
    // Open coin's website
    window.open(`https://www.coingecko.com/en/coins/${coin.id}`, '_blank');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadCoins(false), loadWatchlistCoins(false)]);
    setIsRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Cryptocurrency data has been updated.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-border/50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold gradient-text">CryptoTracker</h1>
            </motion.div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4">
              <SearchBar onSelectCoin={handleSelectCoin} />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="glass-card border-0 bg-card/50 backdrop-blur-xl"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <CurrencySelector currency={currency} onCurrencyChange={handleCurrencyChange} />
              <ThemeToggle theme={theme} onThemeChange={handleThemeChange} />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="all" className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TabsList className="glass-card border-0 bg-card/50 backdrop-blur-xl mb-8">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                All Coins
              </TabsTrigger>
              <TabsTrigger value="watchlist" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Star className="w-4 h-4 mr-2" />
                Watchlist ({watchlistCoins.length})
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="all">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <Card key={i} className="glass-card h-64 animate-pulse">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-full" />
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-20" />
                          <div className="h-3 bg-muted rounded w-16" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-6 bg-muted rounded w-24" />
                        <div className="h-4 bg-muted rounded w-16" />
                      </div>
                      <div className="h-16 bg-muted rounded" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                <AnimatePresence>
                  {coins.map((coin, index) => (
                    <motion.div
                      key={coin.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CryptoCard
                        coin={coin}
                        currency={currency}
                        onToggleWatchlist={handleToggleWatchlist}
                        onClick={handleCoinClick}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="watchlist">
            {watchlistCoins.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <Card className="glass-card max-w-md mx-auto">
                  <div className="p-8">
                    <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Coins in Watchlist</h3>
                    <p className="text-muted-foreground">
                      Add cryptocurrencies to your watchlist by clicking the star icon on any coin card.
                    </p>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {watchlistCoins.map((coin, index) => (
                  <motion.div
                    key={coin.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CryptoCard
                      coin={coin}
                      currency={currency}
                      onToggleWatchlist={handleToggleWatchlist}
                      onClick={handleCoinClick}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}