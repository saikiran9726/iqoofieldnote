import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  'aria-label': string; // Required for strict accessibility
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  'aria-label': ariaLabel,
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg',
    md: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl', // 48dp minimum accessible touch target
    lg: 'w-14 h-14 min-w-[56px] min-h-[56px] rounded-2xl',
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  const variantClasses = {
    primary:
      'bg-semantic-green text-text-inverse hover:brightness-110 active:scale-95 shadow-sm',
    secondary:
      'bg-bg-surface2 text-text-primary border border-border-default hover:bg-bg-hover hover:border-border-strong active:scale-95',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-surface2 active:scale-95',
    destructive:
      'bg-semantic-red-surface text-semantic-red-text border border-semantic-red-border hover:brightness-110 active:scale-95',
  }[variant];

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center transition-all select-none
        ${sizeClasses}
        ${variantClasses}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className={`${iconSizes} animate-spin`} />
      ) : (
        <Icon className={iconSizes} />
      )}
    </button>
  );
};
