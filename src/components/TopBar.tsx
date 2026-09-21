import React, { useRef, useState } from 'react';
import { OfflineBadge } from './OfflineBadge';
import { ThemeToggle } from './ThemeToggle';
import { Activity, Cpu } from 'lucide-react';
import { useSettingsStore } from '../lib/stores';

interface TopBarProps {
  title?: string;
  subtitle?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle }) => {
  const engineKind = useSettingsStore((s) => s.settings.engineKind);
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const startLongPress = () => {
    setIsPressing(true);
    timerRef.current = window.setTimeout(() => {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.(50);
      }
      const demoBtn = document.getElementById('demo-tour-toggle');
      if (demoBtn) {
        demoBtn.click();
      }
      setIsPressing(false);
    }, 500);
  };

  const cancelLongPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressing(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-bg-surface1/90 backdrop-blur-md border-b border-border-default safe-pt px-4 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            id="app-logo-button"
            onPointerDown={startLongPress}
            onPointerUp={cancelLongPress}
            onPointerLeave={cancelLongPress}
            className={`
              flex items-center justify-center w-8 h-8 rounded-lg bg-bg-surface2 border border-border-subtle text-semantic-green shrink-0 transition-transform select-none cursor-pointer
              ${isPressing ? 'scale-90 bg-semantic-green/20' : 'hover:scale-105'}
            `}
            title="FieldNote (Long-press 500ms to open Demo Tour)"
            aria-label="FieldNote logo, hold for demo tour"
          >
            <Activity className={`w-5 h-5 ${isPressing ? 'animate-spin' : ''}`} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1
                onPointerDown={startLongPress}
                onPointerUp={cancelLongPress}
                onPointerLeave={cancelLongPress}
                className="text-body-lg font-bold tracking-tight text-text-primary truncate select-none cursor-pointer"
                title="Hold 500ms for Demo Tour"
              >
                {title || 'FieldNote'}
              </h1>

              {engineKind === 'simulated' ? (
                <span
                  className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-semantic-amber-surface text-semantic-amber-text border border-semantic-amber-border"
                  title="Running in Demo Mode with Simulated Intelligence Engine"
                >
                  <Cpu className="w-2.5 h-2.5" />
                  <span>Simulated engine</span>
                </span>
              ) : (
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-bg-surface2 text-text-muted border border-border-subtle">
                  v0.1
                </span>
              )}
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
