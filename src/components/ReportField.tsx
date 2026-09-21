import React, { useState, useEffect } from 'react';
import { Edit3, Check, X, RotateCcw } from 'lucide-react';
import { ConfidenceBadge } from './ConfidenceBadge';

export interface ReportFieldProps {
  id?: string;
  label: string;
  value: string;
  fieldKey: string;
  confidence?: number;
  isMissing?: boolean;
  isHighlighted?: boolean;
  onSave: (fieldKey: string, newValue: string) => void;
  onUndo?: (fieldKey: string) => void;
  canUndo?: boolean;
  onFieldClick?: () => void;
}

export const ReportField: React.FC<ReportFieldProps> = ({
  id,
  label,
  value,
  fieldKey,
  confidence,
  isMissing = false,
  isHighlighted = false,
  onSave,
  onUndo,
  canUndo = false,
  onFieldClick,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSave(fieldKey, editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  return (
    <div
      id={id || `field-${fieldKey}`}
      className={`
        p-3.5 rounded-xl border transition-all space-y-2
        ${
          isHighlighted
            ? 'ring-2 ring-semantic-green bg-semantic-green-surface/20 border-semantic-green'
            : isMissing
            ? 'bg-semantic-amber-surface/20 border-semantic-amber-border'
            : 'bg-bg-surface1 border-border-default hover:border-border-strong'
        }
      `}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-metadata-xs font-mono font-semibold uppercase tracking-wider text-text-muted">
            {label}
          </span>
          {isMissing && (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase bg-semantic-amber-surface text-semantic-amber-text border border-semantic-amber-border">
              MISSING
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {confidence !== undefined && (
            <ConfidenceBadge
              confidence={confidence}
              size="sm"
              isMissing={isMissing}
            />
          )}

          {canUndo && onUndo && (
            <button
              type="button"
              aria-label={`Undo edit for ${label}`}
              onClick={() => onUndo(fieldKey)}
              className="p-1 rounded text-text-muted hover:text-semantic-amber hover:bg-bg-surface2 focus-visible:ring-2 focus-visible:ring-semantic-green transition-colors"
              title="Revert to previous version in hash chain"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {!isEditing && (
            <button
              type="button"
              aria-label={`Edit ${label}`}
              onClick={() => {
                setEditValue(value);
                setIsEditing(true);
              }}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-surface2 focus-visible:ring-2 focus-visible:ring-semantic-green transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {!isEditing ? (
        <div
          onClick={() => {
            if (onFieldClick) {
              onFieldClick();
            } else {
              setEditValue(value);
              setIsEditing(true);
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setEditValue(value);
              setIsEditing(true);
            }
          }}
          className="cursor-pointer group select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-semantic-green rounded p-0.5 -m-0.5"
          title="Tap to edit or view source in transcript"
        >
          <p className="text-body-sm font-semibold text-text-primary font-sans group-hover:text-semantic-green transition-colors">
            {value || <span className="text-text-muted italic">Not specified (Tap to add)</span>}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancel();
            }}
            className="flex-1 px-3 py-1.5 rounded-lg bg-bg-surface2 border border-border-default text-text-primary text-body-sm focus:outline-none focus:border-semantic-green focus:ring-1 focus:ring-semantic-green"
            autoFocus
          />
          <button
            type="submit"
            aria-label="Save changes"
            className="p-2 rounded-lg bg-semantic-green text-text-inverse hover:brightness-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-semantic-green transition-transform"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Cancel editing"
            onClick={handleCancel}
            className="p-2 rounded-lg bg-bg-surface2 text-text-secondary hover:bg-bg-hover active:scale-95 focus-visible:ring-2 focus-visible:ring-semantic-green transition-transform"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </div>
  );
};

