import type {
  ReportEngine,
  EngineProgressCallback,
  ExtractedEntities,
  VerificationResult,
} from './types';
import type {
  Report,
  Transcript,
  EngineKind,
} from '../shared/types';
import { GENESIS_HASH, createEditHistoryEntry } from '../lib/hashChain';
import { SEED_TRANSCRIPTS, SEED_FINDINGS, SEED_ACTIONS } from '../data/seedData';

export interface SimulatedEngineOptions {
  stepDelayMs?: number;
  instant?: boolean;
}

export class SimulatedEngine implements ReportEngine {
  readonly kind: EngineKind = 'simulated';
  private options: SimulatedEngineOptions;

  constructor(options: SimulatedEngineOptions = {}) {
    this.options = {
      stepDelayMs: options.stepDelayMs ?? 150,
      instant: options.instant ?? false,
    };
  }

  private async sleep(ms: number): Promise<void> {
    if (this.options.instant || ms <= 0) return;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async transcribe(
    _audio: Blob | string,
    onProgress?: EngineProgressCallback
  ): Promise<Transcript> {
    onProgress?.({
      stage: 'transcribing',
      progress: 25,
      message: 'Processing acoustic waveform & language identification (Telugu/English)...',
    });
    await this.sleep(this.options.stepDelayMs ?? 100);

    onProgress?.({
      stage: 'transcribing',
      progress: 60,
      message: 'Aligning character offsets and token boundaries...',
    });
    await this.sleep(this.options.stepDelayMs ?? 100);

    const transcript = SEED_TRANSCRIPTS[0] ?? {
      id: `tr-${Date.now()}`,
      reportId: `rep-${Date.now()}`,
      rawText: 'Field inspection completed. 3 loose connections identified.',
      audioDurationMs: 15400,
      segments: [],
    };

    onProgress?.({
      stage: 'transcribing',
      progress: 100,
      message: 'Transcription complete (Code-mixed Telugu + English)',
      data: transcript,
    });

    return transcript;
  }

  async extract(
    _transcript: Transcript,
    onProgress?: EngineProgressCallback
  ): Promise<ExtractedEntities> {
    onProgress?.({
      stage: 'extracting',
      progress: 30,
      message: 'Parsing unstructured transcript for hazard entities & equipment tags...',
    });
    await this.sleep(this.options.stepDelayMs ?? 100);

    onProgress?.({
      stage: 'extracting',
      progress: 75,
      message: 'Extracting punch-list action items and assignee assignments...',
    });
    await this.sleep(this.options.stepDelayMs ?? 100);

    const findings = SEED_FINDINGS.filter((f) => f.reportId === 'rep-hero-001');
    const actions = SEED_ACTIONS.filter((a) => a.reportId === 'rep-hero-001');

    const result: ExtractedEntities = {
      findings,
      actions,
      siteName: 'Kukatpally Metro Site',
      inspector: 'K. S. Rao (Field Eng #104)',
      panelId: undefined,
      isPanelIdMissing: true,
      priority: 'high',
      priorityReason: 'Critical thermal load and loose terminals pose immediate fire hazard',
    };

    onProgress?.({
      stage: 'extracting',
      progress: 100,
      message: `Extracted ${findings.length} findings, ${actions.length} action items.`,
      data: result,
    });

    return result;
  }

  async verify(
    entities: ExtractedEntities,
    onProgress?: EngineProgressCallback
  ): Promise<VerificationResult> {
    onProgress?.({
      stage: 'verifying',
      progress: 50,
      message: 'Cross-verifying equipment tags against local asset registry...',
    });
    await this.sleep(this.options.stepDelayMs ?? 100);

    const missingEntities: string[] = [];
    if (entities.isPanelIdMissing) {
      missingEntities.push('Panel ID');
    }

    const result: VerificationResult = {
      verifiedFindings: entities.findings.map((f) => ({ ...f, isVerified: true })),
      verifiedActions: entities.actions,
      overallConfidence: 0.94,
      missingEntities,
    };

    onProgress?.({
      stage: 'verifying',
      progress: 100,
      message: 'Entity verification complete. 1 missing field flagged.',
      data: result,
    });

    return result;
  }

  async buildReport(
    input: {
      transcript?: Transcript;
      rawText?: string;
      audioBlob?: Blob;
      overrides?: Partial<Report>;
    },
    onProgress?: EngineProgressCallback
  ): Promise<Report> {
    onProgress?.({
      stage: 'building',
      progress: 20,
      message: 'Initializing cryptographic audit trail...',
    });

    const transcript =
      input.transcript ?? (await this.transcribe(input.rawText ?? '', onProgress));
    const extracted = await this.extract(transcript, onProgress);
    const verified = await this.verify(extracted, onProgress);

    onProgress?.({
      stage: 'building',
      progress: 80,
      message: 'Compiling structured report dossier with SHA-256 seal...',
    });
    await this.sleep(this.options.stepDelayMs ?? 100);

    const reportId = input.overrides?.id ?? `rep-${Date.now()}`;
    const editEntry = await createEditHistoryEntry({
      entityId: reportId,
      entityType: 'report',
      field: 'status',
      before: 'draft',
      after: 'in_review',
      prevHash: GENESIS_HASH,
    });

    const report: Report = {
      id: reportId,
      title: input.overrides?.title ?? 'Electrical Inspection — Substation Panel Audit',
      category: input.overrides?.category ?? 'ELECTRICAL INSPECTION',
      siteId: input.overrides?.siteId ?? 'site-kukatpally',
      siteName: input.overrides?.siteName ?? extracted.siteName,
      inspector: input.overrides?.inspector ?? extracted.inspector,
      createdAt: new Date().toISOString(),
      status: 'in_review',
      priority: input.overrides?.priority ?? extracted.priority,
      priorityReason: input.overrides?.priorityReason ?? extracted.priorityReason,
      deadline: input.overrides?.deadline ?? '19 Sep 2026 morning',
      geo: input.overrides?.geo ?? {
        latitude: 17.4947,
        longitude: 78.3996,
        accuracy: 4.5,
        address: 'Metro Pillar 742, Kukatpally, Hyderabad, Telangana',
      },
      summary:
        input.overrides?.summary ??
        '3 loose connections detected on Terminal Block B with severe thermal oxidation. Phase R feeder cable has chafed insulation. Urgent torquing required before morning shift.',
      findings: verified.verifiedFindings,
      actions: verified.verifiedActions,
      evidenceIds: [],
      editHistory: [editEntry],
      isHero: false,
      panelId: input.overrides?.panelId,
      isPanelIdMissing: input.overrides?.panelId ? false : extracted.isPanelIdMissing,
      overallConfidence: verified.overallConfidence,
      confidenceBreakdown: {
        findings: 0.94,
        category: 0.97,
        deadline: 0.81,
        location: 0.99,
      },
    };

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Field dossier successfully compiled and indexed in local database.',
      data: report,
    });

    return report;
  }
}
