import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  count?: number;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  active,
  onClick,
  icon: Icon,
  count,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-metadata font-medium transition-all select-none min-h-[36px]
        ${
          active
            ? 'bg-semantic-green text-text-inverse font-bold shadow-sm active:scale-95'
            : 'bg-bg-surface1 text-text-secondary border border-border-default hover:bg-bg-surface2 hover:text-text-primary active:scale-95'
        }
      `}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`
            px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold
            ${active ? 'bg-black/20 text-text-inverse' : 'bg-bg-surface2 text-text-muted'}
          `}
        >
          {count}
        </span>
      )}
    </button>
  );
};
