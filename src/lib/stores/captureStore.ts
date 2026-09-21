import { create } from 'zustand';
import type { Transcript } from '../../shared/types';
import type { EngineStage, EngineProgressEvent } from '../../engine/types';
import { defaultEngine } from '../../engine';
import { db } from '../../data/db';

interface CaptureStoreState {
  isRecording: boolean;
  recordingDurationMs: number;
  engineStage: EngineStage;
  engineProgress: number;
  engineMessage: string;
  currentTranscript: Transcript | null;
  startRecording: () => void;
  stopRecordingAndProcess: (onComplete?: (reportId: string) => void) => Promise<void>;
  cancelRecording: () => void;
}

let timerInterval: ReturnType<typeof setInterval> | null = null;

export const useCaptureStore = create<CaptureStoreState>((set) => ({
  isRecording: false,
  recordingDurationMs: 0,
  engineStage: 'idle',
  engineProgress: 0,
  engineMessage: '',
  currentTranscript: null,

  startRecording: () => {
    if (timerInterval) clearInterval(timerInterval);
    set({
      isRecording: true,
      recordingDurationMs: 0,
      engineStage: 'idle',
      engineProgress: 0,
      engineMessage: 'Recording audio buffer in local memory...',
    });

    const startTime = Date.now();
    timerInterval = setInterval(() => {
      set({ recordingDurationMs: Date.now() - startTime });
    }, 100);
  },

  stopRecordingAndProcess: async (onComplete) => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    set({ isRecording: false, engineStage: 'transcribing', engineProgress: 10 });

    try {
      const report = await defaultEngine.buildReport(
        { rawText: 'Recorded audio stream' },
        (event: EngineProgressEvent) => {
          set({
            engineStage: event.stage,
            engineProgress: event.progress,
            engineMessage: event.message,
          });
        }
      );

      // Save report in Dexie
      await db.reports.put(report);
      set({ engineStage: 'complete', engineProgress: 100, engineMessage: 'Done' });

      if (onComplete) {
        onComplete(report.id);
      }
    } catch {
      set({
        engineStage: 'error',
        engineProgress: 0,
        engineMessage: 'Engine processing error.',
      });
    }
  },

  cancelRecording: () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    set({
      isRecording: false,
      recordingDurationMs: 0,
      engineStage: 'idle',
      engineProgress: 0,
      engineMessage: '',
      currentTranscript: null,
    });
  },
}));
