import { Clock, User, Check } from 'lucide-react';
import type { Action } from '../shared/types';
import { PriorityBadge } from './PriorityBadge';

export interface ActionCardProps {
  action: Action;
  onToggleStatus?: (id: string) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action, onToggleStatus }) => {
  const isDone = action.status === 'done' || action.isCompleted;

  return (
    <div
      className={`
        p-4 rounded-xl border transition-all flex items-start justify-between gap-3
        ${
          isDone
            ? 'bg-bg-surface1/60 border-border-subtle opacity-75'
            : 'bg-bg-surface1 border-border-default hover:border-border-strong'
        }
      `}
    >
      <div className="flex items-start gap-3 min-w-0">
        <button
          type="button"
          aria-label={isDone ? 'Mark task as incomplete' : 'Mark task as complete'}
          onClick={() => onToggleStatus?.(action.id)}
          className={`
            mt-0.5 w-6 h-6 min-w-[24px] min-h-[24px] rounded-lg border flex items-center justify-center transition-all shrink-0 cursor-pointer
            ${
              isDone
                ? 'bg-semantic-green border-semantic-green text-text-inverse shadow-sm'
                : 'border-border-strong bg-bg-surface2 hover:border-semantic-green'
            }
          `}
        >
          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        <div className="space-y-1 min-w-0">
          <p
            className={`text-body-sm font-semibold leading-snug ${
              isDone ? 'line-through text-text-muted' : 'text-text-primary'
            }`}
          >
            {action.title}
          </p>

          {action.description && (
            <p className="text-metadata text-text-secondary leading-relaxed">
              {action.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1 text-metadata text-text-muted">
            {action.isNew && (
              <span className="px-2 py-0.5 rounded text-metadata-xs font-mono font-bold bg-semantic-amber-surface text-semantic-amber-text border border-semantic-amber-border">
                [NEWLY APPENDED]
              </span>
            )}
            <PriorityBadge priority={action.priority} size="sm" />
            {action.assignee && (
              <span className="flex items-center gap-1 font-mono text-text-secondary">
                <User className="w-3 h-3 text-text-muted" />
                <span>{action.assignee}</span>
              </span>
            )}
            {action.dueDate && (
              <span className="flex items-center gap-1 font-mono text-semantic-amber">
                <Clock className="w-3 h-3" />
                <span>Due: {new Date(action.dueDate).toLocaleDateString()}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
