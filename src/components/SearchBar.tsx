import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onFilterClick?: () => void;
  hasActiveFilters?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search field notes, reports, equipment IDs...',
  onClear,
  onFilterClick,
  hasActiveFilters = false,
}) => {
  return (
    <div className="relative flex items-center w-full">
      <Search className="w-4 h-4 absolute left-3.5 text-text-muted pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[48px] pl-10 pr-20 py-2.5 rounded-xl bg-bg-surface1 border border-border-default text-text-primary placeholder:text-text-muted text-body-sm focus:outline-none focus:border-semantic-green transition-colors"
      />

      <div className="absolute right-2 flex items-center gap-1">
        {value && (
          <button
            type="button"
            aria-label="Clear search query"
            onClick={() => {
              onChange('');
              onClear?.();
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {onFilterClick && (
          <button
            type="button"
            aria-label="Toggle filters"
            onClick={onFilterClick}
            className={`
              w-8 h-8 flex items-center justify-center rounded-lg border transition-colors
              ${
                hasActiveFilters
                  ? 'bg-semantic-green/10 text-semantic-green border-semantic-green/30'
                  : 'text-text-secondary border-transparent hover:bg-bg-surface2'
              }
            `}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
