import React, { useState } from 'react';
import { Mic, FileText, Plus, Clock, MapPin, Tag } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import type { CaptureItem } from '../../shared/types';

export const CaptureScreen: React.FC = () => {
  const [captures, setCaptures] = useState<CaptureItem[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showQuickNote, setShowQuickNote] = useState<boolean>(false);
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteText, setNoteText] = useState<string>('');

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
    } else {
      setIsRecording(false);
      // Create captured voice note
      const newCapture: CaptureItem = {
        id: `cap-${Date.now()}`,
        createdAt: new Date().toISOString(),
        title: `Field Voice Memo #${captures.length + 1}`,
        transcript: 'Pump station valve B-12 inspected. Minor hydraulic pressure drop noticed at 42 PSI. Gasket replacement recommended.',
        audioDurationMs: 14200,
        location: {
          latitude: 17.3850,
          longitude: 78.4867,
          accuracy: 4.5,
        },
        tags: ['Pump-Station', 'Valve-B12', 'Hydraulics'],
        status: 'draft',
      };
      setCaptures([newCapture, ...captures]);
    }
  };

  const handleSaveQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const newCapture: CaptureItem = {
      id: `cap-${Date.now()}`,
      createdAt: new Date().toISOString(),
      title: noteTitle.trim() || `Field Log #${captures.length + 1}`,
      transcript: noteText.trim(),
      tags: ['Manual-Entry'],
      status: 'draft',
    };
    setCaptures([newCapture, ...captures]);
    setNoteTitle('');
    setNoteText('');
    setShowQuickNote(false);
  };

  const handleCreateSample = () => {
    const sample: CaptureItem = {
      id: `cap-sample-${Date.now()}`,
      createdAt: new Date().toISOString(),
      title: 'Structural Foundation Audit — Bay 4',
      transcript: 'Reinforcement bar spacing verified at 150mm. Concrete pour temperature within tolerance at 24°C. Expansion joint sealant curing properly.',
      location: {
        latitude: 17.4435,
        longitude: 78.3772,
        accuracy: 3.2,
      },
      tags: ['Civil', 'Bay-4', 'Inspection'],
      status: 'processed',
    };
    setCaptures([sample, ...captures]);
  };

  return (
    <div className="space-y-6">
      {/* Quick Action Hero Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-bg-surface1 border border-border-default shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-heading-sm font-bold text-text-primary">
              Multi-Modal Field Capture
            </h2>
            <p className="text-metadata text-text-muted mt-0.5">
              Zero-latency offline audio capture & local transcription
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleToggleRecord}
              className={`
                flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-body-sm transition-all select-none
                ${
                  isRecording
                    ? 'bg-semantic-red text-white animate-pulse shadow-lg shadow-semantic-red/20'
                    : 'bg-semantic-green text-text-inverse hover:brightness-110 shadow-sm'
                }
              `}
            >
              <Mic className="w-4 h-4" />
              <span>{isRecording ? 'Stop Recording' : 'Voice Memo'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowQuickNote(!showQuickNote)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-bg-surface2 border border-border-default text-text-primary text-body-sm font-medium hover:bg-bg-hover transition-colors"
            >
              <FileText className="w-4 h-4 text-text-secondary" />
              <span className="hidden sm:inline">Text</span>
            </button>

            <button
              type="button"
              onClick={handleCreateSample}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-bg-surface2 border border-border-default text-text-primary text-body-sm font-medium hover:bg-bg-hover transition-colors"
              title="Add sample field entry"
            >
              <Plus className="w-4 h-4 text-text-secondary" />
              <span className="hidden sm:inline">Sample</span>
            </button>
          </div>
        </div>

        {/* Quick Note Drawer */}
        {showQuickNote && (
          <form onSubmit={handleSaveQuickNote} className="mt-4 pt-4 border-t border-border-subtle space-y-3">
            <input
              type="text"
              placeholder="Note title (optional)..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bg-surface2 border border-border-default text-text-primary placeholder:text-text-muted text-body-sm focus:outline-none focus:border-semantic-green"
            />
            <textarea
              rows={3}
              placeholder="Write field observations, equipment serials, or site conditions..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bg-surface2 border border-border-default text-text-primary placeholder:text-text-muted text-body-sm focus:outline-none focus:border-semantic-green resize-none"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowQuickNote(false)}
                className="px-3 py-1.5 rounded-lg text-metadata font-medium text-text-secondary hover:bg-bg-surface2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-metadata font-semibold bg-semantic-green text-text-inverse hover:brightness-110"
              >
                Save Note
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Captures List or Empty State */}
      {captures.length === 0 ? (
        <EmptyState
          icon={Mic}
          badge="Ready for input"
          title="No Field Captures Yet"
          description="Ready for field voice memos, sensor logs, or quick findings. Push to record or tap to draft your first field observation."
          actions={[
            {
              label: isRecording ? 'Stop Recording' : 'Start Voice Memo',
              icon: Mic,
              onClick: handleToggleRecord,
              variant: 'primary',
            },
            {
              label: 'Load Sample Audit',
              icon: Plus,
              onClick: handleCreateSample,
              variant: 'secondary',
            },
          ]}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-metadata font-mono font-medium text-text-muted uppercase tracking-wider">
              Recent Captures ({captures.length})
            </span>
            <button
              type="button"
              onClick={() => setCaptures([])}
              className="text-metadata text-text-muted hover:text-semantic-red transition-colors"
            >
              Clear all
            </button>
          </div>

          {captures.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-bg-surface1 border border-border-default shadow-sm hover:border-border-strong transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-bg-surface2 flex items-center justify-center text-semantic-green shrink-0">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-body-md font-semibold text-text-primary">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-3 text-metadata text-text-muted mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1 text-semantic-green font-mono">
                          <MapPin className="w-3 h-3" />
                          {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span
                  className={`
                    px-2 py-0.5 rounded-full text-metadata-xs font-mono font-medium uppercase
                    ${
                      item.status === 'processed'
                        ? 'bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border'
                        : 'bg-semantic-amber-surface text-semantic-amber-text border border-semantic-amber-border'
                    }
                  `}
                >
                  {item.status}
                </span>
              </div>

              <p className="text-body-sm text-text-secondary bg-bg-surface2/60 p-3 rounded-lg border border-border-subtle leading-relaxed">
                {item.transcript}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {item.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-metadata-xs font-mono bg-bg-surface2 text-text-muted border border-border-subtle"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
