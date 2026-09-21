export type ThemeMode = 'dark' | 'daylight' | 'system';
export type ResolvedTheme = 'dark' | 'daylight';
export type EngineKind = 'simulated' | 'on-device';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type ReportStatus = 'draft' | 'in_review' | 'verified' | 'archived';
export type AssetStatus = 'operational' | 'maintenance_required' | 'critical' | 'decommissioned';

export interface Finding {
  id: string;
  reportId: string;
  text: string;
  category: string;
  severity: SeverityLevel;
  confidence: number; // 0.0 - 1.0
  isVerified: boolean;
  assetId?: string;
  occurrences?: number;
  locationDetails?: string;
  isNew?: boolean;
}

export interface Action {
  id: string;
  reportId?: string;
  title: string;
  description?: string;
  assignee?: string;
  priority: SeverityLevel;
  status: TaskStatus;
  dueDate?: string;
  isCompleted: boolean;
  isNew?: boolean;
}

export interface Evidence {
  id: string;
  reportId: string;
  type: 'photo' | 'audio' | 'sensor';
  blob?: Blob;
  url?: string;
  caption?: string;
  timestamp: string;
  geo?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

export interface EditHistoryEntry {
  id: string;
  entityId: string;
  entityType: 'report' | 'finding' | 'action' | 'asset';
  field: string;
  before: unknown;
  after: unknown;
  timestamp: string;
  prevHash: string;
  hash: string;
}

export interface ConfidenceBreakdown {
  findings: number;
  category: number;
  deadline: number;
  location?: number;
}

export interface Report {
  id: string;
  title: string;
  category?: string;
  siteId: string;
  siteName: string;
  inspector: string;
  createdAt: string;
  updatedAt?: string;
  status: ReportStatus;
  priority: SeverityLevel;
  priorityReason?: string;
  summary: string;
  findings: Finding[];
  actions: Action[];
  evidenceIds: string[];
  editHistory: EditHistoryEntry[];
  isHero?: boolean;
  panelId?: string;
  isPanelIdMissing?: boolean;
  overallConfidence: number; // 0.0 - 1.0
  confidenceBreakdown?: ConfidenceBreakdown;
  deadline?: string;
  geo?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  signatureDataUrl?: string;
  signedAt?: string;
}

export interface AssetIssueHistory {
  issue: string;
  date: string;
  reportId: string;
  severity: SeverityLevel;
}

export interface Asset {
  id: string;
  tagId: string; // e.g. PANEL-204
  name: string;
  category: string;
  siteId: string;
  siteName: string;
  lastInspected: string;
  status: AssetStatus;
  issueHistory: AssetIssueHistory[];
}

export interface Site {
  id: string;
  name: string;
  location: string;
  code: string;
  activeAuditsCount: number;
}

export interface TranscriptSegment {
  text: string;
  startMs: number;
  endMs: number;
  startChar: number;
  endChar: number;
  language: 'en' | 'te' | 'hi';
  confidence: number;
}

export interface Transcript {
  id: string;
  reportId: string;
  rawText: string;
  audioDurationMs: number;
  segments: TranscriptSegment[];
}

export interface TemplateField {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'date';
  required: boolean;
  defaultConfidenceThreshold?: number;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  fields: TemplateField[];
}

export interface GlossaryEntry {
  id: string;
  term: string;
  transliteration?: string;
  language: string;
  definition: string;
  expansion?: string;
  category?: 'site' | 'asset' | 'person' | 'term';
}

export interface SyncOutboxItem {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  payload: unknown;
  createdAt: string;
  attempts: number;
}

export interface AppSettings {
  id: string; // 'current'
  engineKind: EngineKind; // default 'simulated'
  syncEnabled: boolean; // default false
  theme: ThemeMode;
  preferredLanguage: 'en-US' | 'te-IN' | 'hi-IN';
  volumeButtonTrigger: boolean;
  useOnlineSpeech: boolean; // default false
  privacyModeRedaction?: boolean;
  passcode?: string;
  biometricEnabled?: boolean;
  encryptionActive?: boolean;
}

// Legacy compatibility aliases
export type CaptureItem = Report;
export type FieldReport = Report;
export type FieldTask = Action;
export type AssetRecord = Asset;
export type SpeechSettings = Pick<AppSettings, 'useOnlineSpeech' | 'preferredLanguage' | 'volumeButtonTrigger'>;
