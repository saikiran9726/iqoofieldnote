import type {
  Report,
  Finding,
  Action,
  Transcript,
  EngineKind,
} from '../shared/types';

export type EngineStage =
  | 'idle'
  | 'transcribing'
  | 'extracting'
  | 'verifying'
  | 'building'
  | 'complete'
  | 'error';

export interface EngineProgressEvent {
  stage: EngineStage;
  progress: number; // 0 - 100
  message: string;
  data?: unknown;
}

export type EngineProgressCallback = (event: EngineProgressEvent) => void;

export interface ExtractedEntities {
  findings: Finding[];
  actions: Action[];
  siteName: string;
  inspector: string;
  panelId?: string;
  isPanelIdMissing: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  priorityReason?: string;
}

export interface VerificationResult {
  verifiedFindings: Finding[];
  verifiedActions: Action[];
  overallConfidence: number;
  missingEntities: string[];
}

export interface ReportEngine {
  readonly kind: EngineKind;
  transcribe(
    audio: Blob | string,
    onProgress?: EngineProgressCallback
  ): Promise<Transcript>;

  extract(
    transcript: Transcript,
    onProgress?: EngineProgressCallback
  ): Promise<ExtractedEntities>;

  verify(
    entities: ExtractedEntities,
    onProgress?: EngineProgressCallback
  ): Promise<VerificationResult>;

  buildReport(
    input: {
      transcript?: Transcript;
      rawText?: string;
      audioBlob?: Blob;
      overrides?: Partial<Report>;
    },
    onProgress?: EngineProgressCallback
  ): Promise<Report>;
}
