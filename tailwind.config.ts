import type { Config } from 'tailwindcss';
import { tokens } from './src/design/tokens';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--color-bg-base)',
          surface1: 'var(--color-bg-surface1)',
          surface2: 'var(--color-bg-surface2)',
          elevated: 'var(--color-bg-elevated)',
          hover: 'var(--color-bg-hover)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          default: 'var(--color-border-default)',
          strong: 'var(--color-border-strong)',
        },
        semantic: {
          green: {
            DEFAULT: 'var(--color-green-base)',
            surface: 'var(--color-green-surface)',
            border: 'var(--color-green-border)',
            text: 'var(--color-green-text)',
          },
          amber: {
            DEFAULT: 'var(--color-amber-base)',
            surface: 'var(--color-amber-surface)',
            border: 'var(--color-amber-border)',
            text: 'var(--color-amber-text)',
          },
          red: {
            DEFAULT: 'var(--color-red-base)',
            surface: 'var(--color-red-surface)',
            border: 'var(--color-red-border)',
            text: 'var(--color-red-text)',
          },
          blue: {
            DEFAULT: 'var(--color-blue-base)',
            surface: 'var(--color-blue-surface)',
            border: 'var(--color-blue-border)',
            text: 'var(--color-blue-text)',
          },
        },
      },
      fontFamily: {
        sans: tokens.typography.fontFamily.sans,
        mono: tokens.typography.fontFamily.mono,
      },
      fontSize: {
        'metadata-xs': ['11px', { lineHeight: '14px' }],
        metadata: ['12px', { lineHeight: '16px' }],
        'metadata-lg': ['13px', { lineHeight: '18px' }],
        'body-sm': ['14px', { lineHeight: '20px' }],
        'body-md': ['15px', { lineHeight: '22px' }],
        'body-lg': ['16px', { lineHeight: '24px' }],
        'heading-sm': ['18px', { lineHeight: '24px' }],
        'heading-md': ['20px', { lineHeight: '28px' }],
        'heading-lg': ['24px', { lineHeight: '32px' }],
        'heading-xl': ['28px', { lineHeight: '36px' }],
      },
      borderRadius: {
        sm: tokens.radii.sm,
        md: tokens.radii.md,
        lg: tokens.radii.lg,
        xl: tokens.radii.xl,
      },
    },
  },
  plugins: [],
};

export default config;
