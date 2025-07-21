import React from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SimpleChart } from '@/components/ui/simple-chart';
import type { CryptoCurrency, Currency } from '@/types/crypto';
import { formatCurrency, formatPercentage, StorageManager } from '@/utils/storage';
import { cn } from '@/lib/utils';

interface CryptoCardProps {
  coin: CryptoCurrency;
  currency: Currency;
  onToggleWatchlist: (coinId: string) => void;
  onClick: (coin: CryptoCurrency) => void;
}

export function CryptoCard({ coin, currency, onToggleWatchlist, onClick }: CryptoCardProps) {
  const isWatched = StorageManager.isInWatchlist(coin.id);
  const isPositive = coin.price_change_percentage_24h > 0;
  
  // Prepare chart data from sparkline
  const chartData = coin.sparkline_in_7d?.price.map((price, index) => ({
    timestamp: Date.now() - (coin.sparkline_in_7d!.price.length - index) * 3600000,
    price,
    time: `${index}h`,
  })) || [];

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWatchlist(coin.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="glass-card hover-glow cursor-pointer relative overflow-hidden group"
        onClick={() => onClick(coin)}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="p-6 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-10 h-10 rounded-full ring-2 ring-primary/20"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                <div className="absolute -bottom-1 -right-1 bg-primary/20 rounded-full p-1">
                  <span className="text-xs font-medium text-primary">#{coin.market_cap_rank}</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{coin.name}</h3>
                <p className="text-sm text-muted-foreground uppercase">{coin.symbol}</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleWatchlistClick}
              className={cn(
                "p-2 rounded-full transition-colors",
                isWatched ? "text-yellow-400 hover:text-yellow-500" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Star className={cn("w-4 h-4", isWatched && "fill-current")} />
            </Button>
          </div>

          {/* Price */}
          <div className="mb-4">
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(coin.current_price, currency)}
            </div>
            <div className={cn(
              "flex items-center space-x-1 text-sm font-medium",
              isPositive ? "text-green-400" : "text-red-400"
            )}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{formatPercentage(coin.price_change_percentage_24h)}</span>
            </div>
          </div>

          {/* Mini Chart */}
          {chartData.length > 0 && (
            <div className="mb-4">
              <SimpleChart
                data={chartData}
                color={isPositive ? "#4ade80" : "#ef4444"}
                height={60}
              />
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Market Cap</p>
              <p className="font-medium">{formatCurrency(coin.market_cap, currency)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Volume (24h)</p>
              <p className="font-medium">{formatCurrency(coin.total_volume, currency)}</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}