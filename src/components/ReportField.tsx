import React, { useState } from 'react';
import { Edit3, Check, X, RotateCcw } from 'lucide-react';
import { ConfidenceBadge } from './ConfidenceBadge';

export interface ReportFieldProps {
  label: string;
  value: string;
  fieldKey: string;
  confidence?: number;
  isMissing?: boolean;
  onSave: (fieldKey: string, newValue: string) => void;
  onUndo?: (fieldKey: string) => void;
  canUndo?: boolean;
}

export const ReportField: React.FC<ReportFieldProps> = ({
  label,
  value,
  fieldKey,
  confidence,
  isMissing = false,
  onSave,
  onUndo,
  canUndo = false,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>(value);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(fieldKey, editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  return (
    <div className="p-3.5 rounded-xl bg-bg-surface1 border border-border-default space-y-2 transition-colors">
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
            <ConfidenceBadge confidence={confidence} size="sm" />
          )}

          {canUndo && onUndo && (
            <button
              type="button"
              aria-label={`Undo edit for ${label}`}
              onClick={() => onUndo(fieldKey)}
              className="p-1 rounded text-text-muted hover:text-semantic-amber hover:bg-bg-surface2 transition-colors"
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
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-surface2 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {!isEditing ? (
        <p className="text-body-sm font-semibold text-text-primary font-sans">
          {value || <span className="text-text-muted italic">Not specified</span>}
        </p>
      ) : (
        <form onSubmit={handleSave} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg bg-bg-surface2 border border-border-default text-text-primary text-body-sm focus:outline-none focus:border-semantic-green"
            autoFocus
          />
          <button
            type="submit"
            aria-label="Save changes"
            className="p-2 rounded-lg bg-semantic-green text-text-inverse hover:brightness-110 active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Cancel editing"
            onClick={handleCancel}
            className="p-2 rounded-lg bg-bg-surface2 text-text-secondary hover:bg-bg-hover active:scale-95"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </div>
  );
};
