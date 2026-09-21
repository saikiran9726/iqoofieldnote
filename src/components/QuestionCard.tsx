import React, { useState, useEffect } from 'react';
import { HelpCircle, Check, Sparkles, Mic, MicOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { useThemeStore } from '../lib/theme';

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
  const prefersReducedMotion = useThemeStore((s) => s.prefersReducedMotion);
  const [customVal, setCustomVal] = useState<string>('');
  const [showInput, setShowInput] = useState<boolean>(false);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [announcement, setAnnouncement] = useState<string>('');

  const handleResolveSuggested = () => {
    setAnnouncement(`Assigned ${suggestedValue} to ${missingField}`);
    onResolve(suggestedValue);
  };

  const handleResolveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customVal.trim()) {
      setAnnouncement(`Assigned ${customVal.trim()} to ${missingField}`);
      onResolve(customVal.trim());
    }
  };

  const startVoiceInput = () => {
    setIsVoiceActive(true);
    setVoiceTranscript('Listening... Speak now ("Panel 204")');
    // Simulate speech recognition result after short interval
    setTimeout(() => {
      setVoiceTranscript('Transcribing: "Panel two zero four"...');
      setTimeout(() => {
        setVoiceTranscript('PANEL-204');
      }, 700);
    }, 1200);
  };

  const confirmVoiceInput = () => {
    const val = voiceTranscript.includes('PANEL-204') ? 'PANEL-204' : voiceTranscript || suggestedValue;
    setIsVoiceActive(false);
    setAnnouncement(`Voice resolved: Assigned ${val} to ${missingField}`);
    onResolve(val);
  };

  const cancelVoiceInput = () => {
    setIsVoiceActive(false);
    setVoiceTranscript('');
  };

  useEffect(() => {
    setAnnouncement(`Question: ${question}`);
  }, [question]);

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -20 }}
      transition={{ duration: prefersReducedMotion ? 0.05 : 0.25, ease: 'easeOut' }}
      className="p-5 rounded-2xl bg-semantic-amber-surface/70 border border-semantic-amber-border space-y-3.5 shadow-sm transition-colors"
    >
      {/* Screen Reader Live Region */}
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-semantic-amber-surface border border-semantic-amber-border flex items-center justify-center text-semantic-amber-text shrink-0 mt-0.5">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase bg-semantic-amber text-text-inverse">
              ONE THING IS MISSING
            </span>
            <span className="text-metadata-xs font-mono text-semantic-amber-text font-semibold">
              Field: {missingField}
            </span>
          </div>
          <h4 className="text-body-sm font-bold text-text-primary">
            {question}
          </h4>
        </div>
      </div>

      {/* Voice Input Active State */}
      <AnimatePresence>
        {isVoiceActive ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3.5 rounded-xl bg-bg-surface1 border border-semantic-amber-border space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-semantic-red animate-pulse" />
                <span className="text-metadata-xs font-mono font-bold uppercase text-semantic-red-text">
                  Voice Input Active
                </span>
              </div>
              <Loader2 className="w-3.5 h-3.5 text-text-muted animate-spin" />
            </div>

            <p className="text-body-sm font-mono text-text-primary font-bold">
              {voiceTranscript}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                variant="primary"
                icon={Check}
                onClick={confirmVoiceInput}
              >
                Confirm Voice Entry
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={MicOff}
                onClick={cancelVoiceInput}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!isVoiceActive && !showInput && (
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
            icon={Mic}
            onClick={startVoiceInput}
          >
            Answer with Voice
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowInput(true)}
          >
            Type Custom ID
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
      )}

      {!isVoiceActive && showInput && (
        <form onSubmit={handleResolveCustom} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder={`Enter ${missingField} (e.g. PANEL-204)...`}
            value={customVal}
            onChange={(e) => setCustomVal(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg bg-bg-surface1 border border-border-default text-text-primary text-body-sm focus:outline-none focus:border-semantic-green focus:ring-1 focus:ring-semantic-green"
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
    </motion.div>
  );
};

