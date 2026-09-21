import React, { useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';

export const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState<string>('');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/more" className="p-1.5 rounded-lg bg-bg-surface1 border border-border-default text-text-muted hover:text-text-primary">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-heading-sm font-bold text-text-primary">Local Full-Text Search</h2>
          <p className="text-metadata text-text-muted">Instant token index across notes, transcripts & tasks</p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search keywords, equipment IDs, serials, or dates..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-bg-surface1 border border-border-default text-text-primary placeholder:text-text-muted text-body-sm focus:outline-none focus:border-semantic-green shadow-sm"
          autoFocus
        />
      </div>

      {!query.trim() ? (
        <EmptyState
          icon={Search}
          badge="IndexedDB Token Index"
          title="Search All Field Records"
          description="Type any keyword to instantly search through transcripts, reports, equipment IDs, and action items stored locally on your device."
          actions={[
            {
              label: 'Search "Pump"',
              onClick: () => setQuery('Pump'),
              variant: 'secondary',
            },
            {
              label: 'Search "Transformer"',
              onClick: () => setQuery('Transformer'),
              variant: 'secondary',
            },
          ]}
        />
      ) : (
        <div className="p-4 rounded-xl bg-bg-surface1 border border-border-default text-center text-text-muted text-body-sm">
          No matches found for <strong className="text-text-primary">"{query}"</strong> in current local database.
        </div>
      )}
    </div>
  );
};
