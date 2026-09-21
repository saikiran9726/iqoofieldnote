/**
 * FieldNote Design Tokens
 * 
 * Strict single source of truth for palettes, typography, spacing, radii, and motion.
 * Complies with Dark (#090B0D, #111417, #181C20) and Daylight (AA+ high-contrast) modes.
 */

export const tokens = {
  colors: {
    dark: {
      bg: {
        base: '#090B0D',
        surface1: '#111417',
        surface2: '#181C20',
        elevated: '#222831',
        hover: '#2A323D',
      },
      text: {
        primary: '#F1F5F9',
        secondary: '#94A3B8',
        muted: '#64748B',
        inverse: '#090B0D',
      },
      border: {
        subtle: '#1F242C',
        default: '#2E3846',
        strong: '#475569',
      },
      semantic: {
        green: {
          base: '#10B981',
          surface: '#064E3B',
          border: '#059669',
          text: '#6EE7B7',
        },
        amber: {
          base: '#F59E0B',
          surface: '#78350F',
          border: '#D97706',
          text: '#FCD34D',
        },
        red: {
          base: '#EF4444',
          surface: '#7F1D1D',
          border: '#DC2626',
          text: '#FCA5A5',
        },
        blue: {
          base: '#38BDF8',
          surface: '#0C4A6E',
          border: '#0284C7',
          text: '#BAE6FD',
        },
      },
    },
    daylight: {
      bg: {
        base: '#F8FAFC',
        surface1: '#FFFFFF',
        surface2: '#EDF2F7',
        elevated: '#E2E8F0',
        hover: '#CBD5E1',
      },
      text: {
        primary: '#0F172A',
        secondary: '#334155',
        muted: '#64748B',
        inverse: '#FFFFFF',
      },
      border: {
        subtle: '#E2E8F0',
        default: '#CBD5E1',
        strong: '#94A3B8',
      },
      semantic: {
        green: {
          base: '#059669',
          surface: '#D1FAE5',
          border: '#10B981',
          text: '#065F46',
        },
        amber: {
          base: '#D97706',
          surface: '#FEF3C7',
          border: '#F59E0B',
          text: '#92400E',
        },
        red: {
          base: '#DC2626',
          surface: '#FEE2E2',
          border: '#EF4444',
          text: '#991B1B',
        },
        blue: {
          base: '#0284C7',
          surface: '#E0F2FE',
          border: '#0EA5E9',
          text: '#075985',
        },
      },
    },
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'Noto Sans Telugu', 'Noto Sans Devanagari', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
    },
    fontSize: {
      'metadata-xs': ['11px', { lineHeight: '14px' }],
      'metadata': ['12px', { lineHeight: '16px' }],
      'metadata-lg': ['13px', { lineHeight: '18px' }],
      'body-sm': ['14px', { lineHeight: '20px' }],
      'body-md': ['15px', { lineHeight: '22px' }],
      'body-lg': ['16px', { lineHeight: '24px' }],
      'heading-sm': ['18px', { lineHeight: '24px', fontWeight: '600' }],
      'heading-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
      'heading-lg': ['24px', { lineHeight: '32px', fontWeight: '700' }],
      'heading-xl': ['28px', { lineHeight: '36px', fontWeight: '800' }],
    },
  },
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
  },
  radii: {
    none: '0px',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    full: '9999px',
  },
  motion: {
    duration: {
      fast: 0.15, // 150ms
      normal: 0.22, // 220ms
      slow: 0.3, // 300ms
    },
    easing: {
      easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
      easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
} as const;

export type ThemeMode = 'dark' | 'daylight' | 'system';
export type ResolvedTheme = 'dark' | 'daylight';
