import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary';
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  actions?: EmptyStateAction[];
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  badge,
  actions = [],
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-8 rounded-2xl bg-bg-surface1 border border-border-default shadow-sm transition-colors">
      <div className="w-16 h-16 rounded-2xl bg-bg-surface2 border border-border-subtle flex items-center justify-center text-semantic-green mb-4">
        <Icon className="w-8 h-8" />
      </div>

      {badge && (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-metadata-xs font-mono font-medium tracking-wide uppercase bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border mb-2.5">
          {badge}
        </span>
      )}

      <h2 className="text-heading-sm font-semibold text-text-primary mb-2">
        {title}
      </h2>

      <p className="text-body-sm text-text-secondary mb-6 leading-relaxed">
        {description}
      </p>

      {actions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          {actions.map((action, idx) => {
            const ActionIcon = action.icon;
            const isPrimary = action.variant !== 'secondary';
            return (
              <button
                key={idx}
                type="button"
                onClick={action.onClick}
                className={`
                  w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-body-sm font-semibold transition-all select-none
                  ${
                    isPrimary
                      ? 'bg-semantic-green text-text-inverse hover:brightness-110 active:scale-[0.98]'
                      : 'bg-bg-surface2 text-text-primary border border-border-default hover:bg-bg-hover active:scale-[0.98]'
                  }
                `}
              >
                {ActionIcon && <ActionIcon className="w-4 h-4" />}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
