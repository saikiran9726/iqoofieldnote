import { create } from 'zustand';
import type { ThemeMode, ResolvedTheme } from '../design/tokens';

interface ThemeState {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  prefersReducedMotion: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  initTheme: () => () => void;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'daylight' : 'dark';
}

function getSystemReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: (typeof localStorage !== 'undefined' && (localStorage.getItem('fieldnote-theme-mode') as ThemeMode)) || 'dark',
  resolvedTheme: 'dark',
  prefersReducedMotion: getSystemReducedMotion(),

  setMode: (mode: ThemeMode) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('fieldnote-theme-mode', mode);
    }
    const resolved = mode === 'system' ? getSystemTheme() : mode;
    applyThemeToDOM(resolved);
    set({ mode, resolvedTheme: resolved });
  },

  toggleTheme: () => {
    const current = get().mode;
    const next: ThemeMode = current === 'dark' ? 'daylight' : current === 'daylight' ? 'system' : 'dark';
    get().setMode(next);
  },

  initTheme: () => {
    const currentMode = get().mode;
    const resolved = currentMode === 'system' ? getSystemTheme() : currentMode;
    applyThemeToDOM(resolved);
    set({ resolvedTheme: resolved, prefersReducedMotion: getSystemReducedMotion() });

    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      if (get().mode === 'system') {
        const sysResolved: ResolvedTheme = e.matches ? 'daylight' : 'dark';
        applyThemeToDOM(sysResolved);
        set({ resolvedTheme: sysResolved });
      }
    };

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      set({ prefersReducedMotion: e.matches });
    };

    colorSchemeQuery.addEventListener('change', handleColorSchemeChange);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      colorSchemeQuery.removeEventListener('change', handleColorSchemeChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  },
}));

function applyThemeToDOM(theme: ResolvedTheme) {
  const root = document.documentElement;
  if (theme === 'daylight') {
    root.classList.add('daylight');
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
    root.classList.remove('daylight');
  }

  // Update theme-color meta tag
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'daylight' ? '#F8FAFC' : '#090B0D');
  }
}
