import React, { useState, useEffect } from 'react';
import { Mic, FileText, Clock } from 'lucide-react';
import {
  EmptyState,
  RecordingWaveform,
  ProcessingTimeline,
  Button,
} from '../../components';
import { useCaptureStore, useReportsStore } from '../../lib/stores';
import type { Report } from '../../shared/types';
import { db } from '../../data/db';

export const CaptureScreen: React.FC = () => {
  const {
    isRecording,
    recordingDurationMs,
    engineStage,
    engineProgress,
    engineMessage,
    startRecording,
    stopRecordingAndProcess,
    cancelRecording,
  } = useCaptureStore();

  const [recentCaptures, setRecentCaptures] = useState<Report[]>([]);
  const [showQuickNote, setShowQuickNote] = useState<boolean>(false);
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteText, setNoteText] = useState<string>('');
  const loadReports = useReportsStore((s) => s.loadReports);

  const loadRecent = async () => {
    const list = await db.reports.toArray();
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRecentCaptures(list.slice(0, 5));
  };

  useEffect(() => {
    loadRecent();
  }, []);

  const handleToggleRecord = async () => {
    if (!isRecording) {
      startRecording();
    } else {
      await stopRecordingAndProcess(async () => {
        await loadRecent();
        await loadReports();
      });
    }
  };

  const handleSaveQuickNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const newReport: Report = {
      id: `rep-${Date.now()}`,
      title: noteTitle.trim() || `Field Note #${recentCaptures.length + 1}`,
      siteId: 'site-kukatpally',
      siteName: 'Kukatpally Metro Site',
      inspector: 'Field Eng. Current User',
      createdAt: new Date().toISOString(),
      status: 'draft',
      priority: 'medium',
      summary: noteText.trim(),
      findings: [],
      actions: [],
      evidenceIds: [],
      editHistory: [],
      overallConfidence: 0.88,
    };

    await db.reports.put(newReport);
    await loadRecent();
    await loadReports();
    setNoteTitle('');
    setNoteText('');
    setShowQuickNote(false);
  };

  return (
    <div className="space-y-6">
      {/* Quick Action Hero Bar */}
      <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default shadow-sm space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-heading-sm font-bold text-text-primary">
              Multi-Modal Field Capture
            </h2>
            <p className="text-metadata text-text-muted mt-0.5">
              Zero-latency offline audio capture & on-device entity extraction
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant={isRecording ? 'destructive' : 'primary'}
              size="md"
              icon={Mic}
              onClick={handleToggleRecord}
              className={isRecording ? 'animate-pulse' : ''}
            >
              {isRecording
                ? `Stop (${(recordingDurationMs / 1000).toFixed(1)}s)`
                : 'Voice Memo'}
            </Button>

            {isRecording && (
              <Button
                variant="ghost"
                size="md"
                onClick={cancelRecording}
              >
                Cancel
              </Button>
            )}

            {!isRecording && (
              <Button
                variant="secondary"
                size="md"
                icon={FileText}
                onClick={() => setShowQuickNote(!showQuickNote)}
              >
                Text
              </Button>
            )}
          </div>
        </div>

        {/* Live Audio Waveform while recording */}
        {isRecording && (
          <div className="p-4 rounded-xl bg-bg-surface2 border border-border-subtle space-y-2">
            <div className="flex items-center justify-between text-metadata text-text-muted">
              <span className="flex items-center gap-1.5 text-semantic-red font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-semantic-red animate-ping" />
                Live Audio Buffer (Local Memory)
              </span>
              <span className="font-mono font-bold text-text-primary">
                {(recordingDurationMs / 1000).toFixed(1)}s
              </span>
            </div>
            <RecordingWaveform isRecording={isRecording} height={52} />
          </div>
        )}

        {/* Engine Pipeline Timeline when processing */}
        {engineStage !== 'idle' && engineStage !== 'complete' && !isRecording && (
          <ProcessingTimeline
            currentStage={engineStage}
            progressPercent={engineProgress}
            message={engineMessage}
          />
        )}

        {/* Quick Note Drawer */}
        {showQuickNote && (
          <form onSubmit={handleSaveQuickNote} className="mt-4 pt-4 border-t border-border-subtle space-y-3">
            <input
              type="text"
              placeholder="Note title (e.g. Pillar 742 crack audit)..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-bg-surface2 border border-border-default text-text-primary placeholder:text-text-muted text-body-sm focus:outline-none focus:border-semantic-green"
            />
            <textarea
              rows={3}
              placeholder="Write field observations, equipment serials, or site conditions..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-bg-surface2 border border-border-default text-text-primary placeholder:text-text-muted text-body-sm focus:outline-none focus:border-semantic-green resize-none"
              required
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowQuickNote(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit">
                Save Note
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Captures List or Empty State */}
      {recentCaptures.length === 0 ? (
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
          ]}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-metadata font-mono font-medium text-text-muted uppercase tracking-wider">
              Recent Field Captures ({recentCaptures.length})
            </span>
          </div>

          {recentCaptures.map((item) => (
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
                      <span className="font-mono text-text-secondary">
                        {item.siteName}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`
                    px-2 py-0.5 rounded-full text-metadata-xs font-mono font-medium uppercase
                    ${
                      item.status === 'verified'
                        ? 'bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border'
                        : 'bg-semantic-amber-surface text-semantic-amber-text border border-semantic-amber-border'
                    }
                  `}
                >
                  {item.status}
                </span>
              </div>

              <p className="text-body-sm text-text-secondary bg-bg-surface2/60 p-3 rounded-lg border border-border-subtle leading-relaxed">
                {item.summary}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
