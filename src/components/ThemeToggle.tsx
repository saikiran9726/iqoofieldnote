import React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useThemeStore } from '../lib/theme';
import type { ThemeMode } from '../design/tokens';

export const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useThemeStore();

  const themes: Array<{ value: ThemeMode; label: string; icon: React.ReactNode }> = [
    { value: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { value: 'daylight', label: 'Daylight', icon: <Sun className="w-3.5 h-3.5" /> },
    { value: 'system', label: 'System', icon: <Laptop className="w-3.5 h-3.5" /> },
  ];

  return (
    <div 
      className="inline-flex items-center p-0.5 rounded-lg bg-bg-surface2 border border-border-default select-none"
      role="radiogroup"
      aria-label="Theme selection"
    >
      {themes.map((t) => {
        const isActive = mode === t.value;
        return (
          <button
            key={t.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${t.label} theme`}
            onClick={() => setMode(t.value)}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-md text-metadata font-medium transition-colors
              ${
                isActive
                  ? 'bg-bg-elevated text-text-primary shadow-sm border border-border-subtle'
                  : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'
              }
            `}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};
