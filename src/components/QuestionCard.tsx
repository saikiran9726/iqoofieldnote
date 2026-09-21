import React, { useState } from 'react';
import { HelpCircle, Check, Sparkles } from 'lucide-react';
import { Button } from './Button';

export interface QuestionCardProps {
  question: string;
  missingField: string;
  suggestedValue?: string;
  onResolve: (value: string) => void;
  onDismiss?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  missingField,
  suggestedValue = 'PANEL-204',
  onResolve,
  onDismiss,
}) => {
  const [customVal, setCustomVal] = useState<string>('');
  const [showInput, setShowInput] = useState<boolean>(false);

  const handleResolveSuggested = () => {
    onResolve(suggestedValue);
  };

  const handleResolveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customVal.trim()) {
      onResolve(customVal.trim());
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-semantic-amber-surface/60 border border-semantic-amber-border space-y-3.5 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-semantic-amber-surface border border-semantic-amber-border flex items-center justify-center text-semantic-amber-text shrink-0 mt-0.5">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase bg-semantic-amber-border text-text-inverse">
              MISSING ENTITY
            </span>
            <span className="text-metadata-xs font-mono text-semantic-amber-text">
              Field: {missingField}
            </span>
          </div>
          <h4 className="text-body-sm font-bold text-text-primary">
            {question}
          </h4>
        </div>
      </div>

      {!showInput ? (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {suggestedValue && (
            <Button
              size="sm"
              variant="primary"
              onClick={handleResolveSuggested}
              icon={Sparkles}
            >
              Assign "{suggestedValue}"
            </Button>
          )}

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowInput(true)}
          >
            Custom Entry
          </Button>

          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          )}
        </div>
      ) : (
        <form onSubmit={handleResolveCustom} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder={`Enter ${missingField}...`}
            value={customVal}
            onChange={(e) => setCustomVal(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg bg-bg-surface1 border border-border-default text-text-primary text-body-sm focus:outline-none focus:border-semantic-green"
            autoFocus
          />
          <Button size="sm" variant="primary" type="submit" icon={Check}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowInput(false)}>
            Cancel
          </Button>
        </form>
      )}
    </div>
  );
};
