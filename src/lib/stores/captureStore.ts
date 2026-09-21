import { create } from 'zustand';
import type { Report } from '../../shared/types';
import type { EngineStage, EngineProgressEvent } from '../../engine/types';
import { defaultEngine } from '../../engine';
import { db } from '../../data/db';
import { AudioRecorder, type AudioRecorderErrorType, type NoiseLevel } from '../audioRecorder';

export type CaptureScreenMode = 'idle' | 'recording' | 'processing' | 'error';

interface CaptureStoreState {
  mode: CaptureScreenMode;
  isPaused: boolean;
  recordingDurationMs: number;
  noiseLevel: NoiseLevel;
  waveformBars: number[];
  liveTranscriptText: string;
  engineStage: EngineStage;
  engineProgress: number;
  engineMessage: string;
  assembledReport: Partial<Report> | null;
  errorType: AudioRecorderErrorType | null;
  errorMessage: string;
  handsFreeMode: boolean;
  silenceTrimming: boolean;
  createdReportId: string | null;

  // Actions
  startCapture: () => Promise<void>;
  pauseCapture: () => void;
  resumeCapture: () => void;
  finishCaptureAndProcess: (onComplete?: (reportId: string) => void) => Promise<void>;
  cancelCapture: () => void;
  setHandsFreeMode: (enabled: boolean) => void;
  setSilenceTrimming: (enabled: boolean) => void;
  clearError: () => void;
  simulatePermissionError: () => void;
  simulateDeviceNotFoundError: () => void;
  simulateDeviceBusyError: () => void;
}

let activeRecorder: AudioRecorder | null = null;
let liveTypingInterval: ReturnType<typeof setInterval> | null = null;

const SAMPLE_LIVE_WORDS = [
  'Panel', 'daggara', 'loose', 'connections', 'unnaayi.',
  'Three', 'loose', 'connections', 'observed', 'at', 'terminal', 'block', 'B,',
  'phase', 'R', 'cable', 'insulation', 'is', 'damaged.',
  'Emi', 'problem', 'ledu', 'immediate', 'ga', 'tighten', 'cheyyali,',
  'repati', 'morning', 'shift', 'lopala', 'action', 'complete', 'kaavali.'
];

export const useCaptureStore = create<CaptureStoreState>((set, get) => ({
  mode: 'idle',
  isPaused: false,
  recordingDurationMs: 0,
  noiseLevel: 'LOW',
  waveformBars: Array(28).fill(0.15),
  liveTranscriptText: '',
  engineStage: 'idle',
  engineProgress: 0,
  engineMessage: '',
  assembledReport: null,
  errorType: null,
  errorMessage: '',
  handsFreeMode: false,
  silenceTrimming: true,
  createdReportId: null,

  startCapture: async () => {
    get().cancelCapture();

    set({
      mode: 'recording',
      isPaused: false,
      recordingDurationMs: 0,
      noiseLevel: 'LOW',
      liveTranscriptText: '',
      errorType: null,
      errorMessage: '',
      assembledReport: null,
      createdReportId: null,
    });

    // Start typewriter live transcript simulation
    let wordIdx = 0;
    liveTypingInterval = setInterval(() => {
      if (wordIdx < SAMPLE_LIVE_WORDS.length) {
        const nextWord = SAMPLE_LIVE_WORDS[wordIdx];
        set((s) => ({
          liveTranscriptText: s.liveTranscriptText ? `${s.liveTranscriptText} ${nextWord}` : nextWord,
        }));
        wordIdx++;
      }
    }, 450);

    activeRecorder = new AudioRecorder({
      onWaveformData: (bars) => set({ waveformBars: bars }),
      onNoiseLevel: (lvl) => set({ noiseLevel: lvl }),
      onDuration: (durationMs) => set({ recordingDurationMs: durationMs }),
      onError: (type, message) => {
        if (liveTypingInterval) clearInterval(liveTypingInterval);
        set({
          mode: 'error',
          errorType: type,
          errorMessage: message,
        });
      },
    });

    const started = await activeRecorder.start();
    if (!started) {
      if (liveTypingInterval) clearInterval(liveTypingInterval);
      // If recorder could not start, mode will be updated via onError callback
    }
  },

  pauseCapture: () => {
    if (activeRecorder) {
      activeRecorder.pause();
      set({ isPaused: true });
    }
  },

  resumeCapture: () => {
    if (activeRecorder) {
      activeRecorder.resume();
      set({ isPaused: false });
    }
  },

  finishCaptureAndProcess: async (onComplete) => {
    if (liveTypingInterval) {
      clearInterval(liveTypingInterval);
      liveTypingInterval = null;
    }

    let audioBlob: Blob | undefined;
    let duration = get().recordingDurationMs;

    if (activeRecorder) {
      const result = await activeRecorder.stop();
      audioBlob = result.blob;
      duration = result.durationMs || duration;
      activeRecorder = null;
    }

    set({
      mode: 'processing',
      engineStage: 'transcribing',
      engineProgress: 15,
      engineMessage: 'LISTENING: Transcribing audio waveform in local memory...',
      assembledReport: {
        siteName: 'Kukatpally Metro Site',
        inspector: 'K. S. Rao (Field Eng #104)',
      },
    });

    try {
      const transcriptText = get().liveTranscriptText || '3 loose connections detected on Terminal Block B.';
      const report = await defaultEngine.buildReport(
        { rawText: transcriptText, audioBlob },
        (event: EngineProgressEvent) => {
          let stageMsg = event.message;
          let progressiveAssembly: Partial<Report> = { ...get().assembledReport };

          if (event.stage === 'transcribing') {
            stageMsg = `LISTENING: ${event.message}`;
            progressiveAssembly = {
              ...progressiveAssembly,
              title: 'Electrical Inspection — Substation Panel Audit',
            };
          } else if (event.stage === 'extracting') {
            stageMsg = `EXTRACTING: ${event.message}`;
            progressiveAssembly = {
              ...progressiveAssembly,
              priority: 'high',
              priorityReason: 'Critical thermal load and loose terminals pose immediate fire hazard',
              isPanelIdMissing: true,
            };
          } else if (event.stage === 'verifying') {
            stageMsg = `VERIFYING: ${event.message}`;
            progressiveAssembly = {
              ...progressiveAssembly,
              overallConfidence: 0.94,
            };
          } else if (event.stage === 'building') {
            stageMsg = `BUILDING REPORT: ${event.message}`;
            progressiveAssembly = {
              ...progressiveAssembly,
              summary: '3 loose connections detected on Terminal Block B with severe thermal oxidation. Phase R feeder cable has chafed insulation.',
            };
          }

          set({
            engineStage: event.stage,
            engineProgress: event.progress,
            engineMessage: stageMsg,
            assembledReport: progressiveAssembly,
          });
        }
      );

      // Save recorded audio evidence into Dexie if available
      if (audioBlob && audioBlob.size > 0) {
        await db.evidence.put({
          id: `evi-rec-${Date.now()}`,
          reportId: report.id,
          type: 'audio',
          blob: audioBlob,
          caption: `Voice Memo (${(duration / 1000).toFixed(1)}s)`,
          timestamp: new Date().toISOString(),
        });
      }

      // Save built report in Dexie
      await db.reports.put(report);

      set({
        engineStage: 'complete',
        engineProgress: 100,
        engineMessage: 'Dossier successfully indexed with SHA-256 seal.',
        createdReportId: report.id,
      });

      // Brief pause to allow user to see completed state before route transition
      setTimeout(() => {
        if (onComplete) {
          onComplete(report.id);
        }
      }, 600);
    } catch {
      set({
        mode: 'error',
        errorType: 'unknown',
        errorMessage: 'Engine processing failed while assembling field report.',
      });
    }
  },

  cancelCapture: () => {
    if (liveTypingInterval) {
      clearInterval(liveTypingInterval);
      liveTypingInterval = null;
    }
    if (activeRecorder) {
      activeRecorder.cancel();
      activeRecorder = null;
    }
    set({
      mode: 'idle',
      isPaused: false,
      recordingDurationMs: 0,
      liveTranscriptText: '',
      engineStage: 'idle',
      engineProgress: 0,
      engineMessage: '',
      assembledReport: null,
      errorType: null,
      errorMessage: '',
    });
  },

  setHandsFreeMode: (enabled) => set({ handsFreeMode: enabled }),
  setSilenceTrimming: (enabled) => set({ silenceTrimming: enabled }),
  clearError: () => set({ mode: 'idle', errorType: null, errorMessage: '' }),

  simulatePermissionError: () => {
    set({
      mode: 'error',
      errorType: 'permission_denied',
      errorMessage: 'Microphone permission was denied. FieldNote requires microphone access for offline voice capture.',
    });
  },

  simulateDeviceNotFoundError: () => {
    set({
      mode: 'error',
      errorType: 'not_found',
      errorMessage: 'No microphone input hardware was detected on this device.',
    });
  },

  simulateDeviceBusyError: () => {
    set({
      mode: 'error',
      errorType: 'busy',
      errorMessage: 'The microphone is currently in use or locked by another application.',
    });
  },
}));
