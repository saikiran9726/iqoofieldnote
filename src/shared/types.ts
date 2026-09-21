export type ThemeMode = 'dark' | 'daylight' | 'system';
export type ResolvedTheme = 'dark' | 'daylight';

export interface SpeechSettings {
  useOnlineSpeech: boolean; // OFF by default
  preferredLanguage: 'en-US' | 'te-IN' | 'hi-IN';
  volumeButtonTrigger: boolean;
}

export interface CaptureItem {
  id: string;
  createdAt: string;
  title: string;
  transcript: string;
  audioBlob?: Blob;
  audioDurationMs?: number;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  tags: string[];
  status: 'draft' | 'processed' | 'archived';
}

export interface FieldReport {
  id: string;
  createdAt: string;
  title: string;
  siteName: string;
  inspector: string;
  summary: string;
  hazards: string[];
  equipmentStatus: Array<{
    name: string;
    condition: 'good' | 'fair' | 'critical';
    notes?: string;
  }>;
  tasksCount: number;
}

export interface FieldTask {
  id: string;
  reportId?: string;
  title: string;
  description?: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: string;
}

export interface AssetRecord {
  id: string;
  tagId: string;
  name: string;
  category: string;
  lastInspected?: string;
  status: 'operational' | 'maintenance_required' | 'decommissioned';
}
