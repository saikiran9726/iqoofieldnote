import React from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onReset?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'System Alert',
  message,
  onRetry,
  onReset,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-8 rounded-2xl bg-semantic-red-surface/40 border border-semantic-red-border shadow-sm transition-colors">
      <div className="w-16 h-16 rounded-2xl bg-semantic-red-surface border border-semantic-red-border flex items-center justify-center text-semantic-red-text mb-4">
        <AlertOctagon className="w-8 h-8" />
      </div>

      <span className="inline-block px-2.5 py-0.5 rounded-full text-metadata-xs font-mono font-bold tracking-wide uppercase bg-semantic-red text-white mb-2.5">
        ERROR
      </span>

      <h2 className="text-heading-sm font-semibold text-text-primary mb-2">
        {title}
      </h2>

      <p className="text-body-sm text-text-secondary mb-6 leading-relaxed">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        {onRetry && (
          <Button
            size="md"
            variant="primary"
            fullWidth
            onClick={onRetry}
            icon={RotateCcw}
          >
            Retry Operation
          </Button>
        )}

        {onReset && (
          <Button
            size="md"
            variant="secondary"
            fullWidth
            onClick={onReset}
            icon={Home}
          >
            Reset to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
};
