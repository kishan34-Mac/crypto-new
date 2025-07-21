import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cryptoApi } from '@/services/cryptoApi';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
}

interface SearchBarProps {
  onSelectCoin: (coinId: string) => void;
  className?: string;
}

export function SearchBar({ onSelectCoin, className }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [trending, setTrending] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load trending coins on mount
  useEffect(() => {
    const loadTrending = async () => {
      try {
        const data = await cryptoApi.getTrendingCoins();
        setTrending(data.coins.slice(0, 5).map(item => ({
          id: item.item.id,
          name: item.item.name,
          symbol: item.item.symbol,
          thumb: item.item.thumb,
        })));
      } catch (error) {
        console.error('Failed to load trending coins:', error);
      }
    };
    loadTrending();
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim()) {
      debounceRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          const data = await cryptoApi.searchCoins(query);
          setResults(data.coins.slice(0, 8));
        } catch (error) {
          console.error('Search failed:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setResults([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleSelectCoin = (coinId: string) => {
    onSelectCoin(coinId);
    setQuery('');
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const displayResults = query.trim() ? results : trending;
  const showDropdown = isOpen && (displayResults.length > 0 || isLoading);

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search cryptocurrencies..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 glass-card border-0 bg-card/50 backdrop-blur-xl"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="glass-card border-0 bg-card/95 backdrop-blur-xl shadow-2xl">
              <div className="p-2">
                {!query.trim() && (
                  <div className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span>Trending</span>
                  </div>
                )}
                
                {isLoading ? (
                  <div className="px-3 py-8 text-center text-muted-foreground">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="mt-2">Searching...</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {displayResults.map((coin) => (
                      <motion.button
                        key={coin.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => handleSelectCoin(coin.id)}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                      >
                        <img
                          src={coin.thumb}
                          alt={coin.name}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{coin.name}</p>
                          <p className="text-sm text-muted-foreground uppercase">{coin.symbol}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}