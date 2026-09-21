import React from 'react';
import { OfflineBadge } from './OfflineBadge';
import { ThemeToggle } from './ThemeToggle';
import { Activity } from 'lucide-react';

interface TopBarProps {
  title?: string;
  subtitle?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-bg-surface1/90 backdrop-blur-md border-b border-border-default safe-pt px-4 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-bg-surface2 border border-border-subtle text-semantic-green shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-body-lg font-bold tracking-tight text-text-primary truncate">
                {title || 'FieldNote'}
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-bg-surface2 text-text-muted border border-border-subtle">
                v0.1
              </span>
            </div>
            {subtitle && (
              <p className="text-metadata text-text-muted truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <OfflineBadge />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
