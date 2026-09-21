import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'min-h-[40px] px-3 py-1.5 text-metadata font-medium gap-1.5',
    md: 'min-h-[48px] px-4 py-2.5 text-body-sm font-semibold gap-2', // 48dp minimum touch target
    lg: 'min-h-[56px] px-6 py-3 text-body-md font-bold gap-2.5', // 56dp primary touch target
  }[size];

  const variantClasses = {
    primary:
      'bg-semantic-green text-text-inverse hover:brightness-110 active:scale-[0.98] shadow-sm',
    secondary:
      'bg-bg-surface2 text-text-primary border border-border-default hover:bg-bg-hover active:scale-[0.98]',
    destructive:
      'bg-semantic-red text-white hover:brightness-110 active:scale-[0.98] shadow-sm',
    outline:
      'bg-transparent text-text-primary border border-border-strong hover:bg-bg-surface2 active:scale-[0.98]',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-surface2 active:scale-[0.98]',
  }[variant];

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-xl transition-all select-none
        ${sizeClasses}
        ${variantClasses}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};
