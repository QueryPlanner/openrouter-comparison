import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { SortOption } from '../types';

interface FiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  minContext: number;
  setMinContext: (val: number) => void;
  sortOption: SortOption;
  setSortOption: (opt: SortOption) => void;
  showFreeOnly: boolean;
  setShowFreeOnly: (show: boolean) => void;
}

export const Filters: React.FC<FiltersProps> = ({
  searchTerm,
  setSearchTerm,
  minContext,
  setMinContext,
  sortOption,
  setSortOption,
  showFreeOnly,
  setShowFreeOnly
}) => {
  return (
    <div className="space-y-6 sticky top-24">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
          <SlidersHorizontal size={20} />
          Filters
        </h3>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search models..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-muted/20 border-border/50 focus-visible:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
                Min Context: <span className="text-foreground font-mono">{minContext.toLocaleString()}</span>
            </label>
            <input 
                type="range"
                min="0"
                max="128000"
                step="4096"
                value={minContext}
                onChange={(e) => setMinContext(Number(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0</span>
                <span>128k+</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
                type="checkbox"
                id="freeOnly"
                checked={showFreeOnly}
                onChange={(e) => setShowFreeOnly(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
            />
            <label 
                htmlFor="freeOnly" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                Show Free Models Only
            </label>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-border/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
            <ArrowUpDown size={20} />
            Sort By
        </h3>
        <div className="space-y-2">
            {[
                { label: 'Price: Low to High', value: 'price_low_high' },
                { label: 'Price: High to Low', value: 'price_high_low' },
                { label: 'Context: Large to Small', value: 'context_high_low' },
                { label: 'Name: A-Z', value: 'name_a_z' },
            ].map((option) => (
                <Button
                    key={option.value}
                    variant={sortOption === option.value ? 'default' : 'ghost'}
                    className={`w-full justify-start ${sortOption === option.value ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'text-muted-foreground'}`}
                    onClick={() => setSortOption(option.value as SortOption)}
                >
                    {option.label}
                </Button>
            ))}
        </div>
      </div>
    </div>
  );
};
