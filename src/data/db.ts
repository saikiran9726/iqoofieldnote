import Dexie, { type Table } from 'dexie';
import type {
  Report,
  Finding,
  Action,
  Evidence,
  Asset,
  Site,
  Transcript,
  EditHistoryEntry,
  Template,
  GlossaryEntry,
  SyncOutboxItem,
  AppSettings,
} from '../shared/types';
import {
  generateSeedReports,
  SEED_SITES,
  SEED_ASSETS,
  SEED_TRANSCRIPTS,
  SEED_FINDINGS,
  SEED_ACTIONS,
  SEED_EVIDENCE,
  SEED_TEMPLATES,
  SEED_GLOSSARY,
  SEED_SETTINGS,
} from './seedData';

export class FieldNoteDatabase extends Dexie {
  reports!: Table<Report, string>;
  findings!: Table<Finding, string>;
  actions!: Table<Action, string>;
  evidence!: Table<Evidence, string>;
  assets!: Table<Asset, string>;
  sites!: Table<Site, string>;
  transcripts!: Table<Transcript, string>;
  editHistory!: Table<EditHistoryEntry, string>;
  templates!: Table<Template, string>;
  glossary!: Table<GlossaryEntry, string>;
  syncOutbox!: Table<SyncOutboxItem, string>;
  settings!: Table<AppSettings, string>;

  // Legacy alias tables for Phase 0 compatibility if needed
  captures!: Table<Report, string>;
  tasks!: Table<Action, string>;

  constructor() {
    super('FieldNoteDB');

    // Version 1: Initial scaffold
    this.version(1).stores({
      captures: 'id, createdAt, status, *tags',
      reports: 'id, createdAt, siteName, inspector',
      tasks: 'id, reportId, priority, status, dueDate',
      assets: 'id, tagId, category, status',
    });

    // Version 2: Full Phase 1 Schema with relations and indexes
    this.version(2).stores({
      reports: 'id, siteId, siteName, inspector, createdAt, status, priority, isHero, panelId',
      findings: 'id, reportId, severity, confidence, isVerified, assetId',
      actions: 'id, reportId, priority, status, assignee, dueDate, isCompleted',
      evidence: 'id, reportId, type, timestamp',
      assets: 'id, tagId, category, siteId, status, lastInspected',
      sites: 'id, code, name',
      transcripts: 'id, reportId',
      editHistory: 'id, entityId, entityType, timestamp, hash, prevHash',
      templates: 'id, name, category',
      glossary: 'id, term, language',
      syncOutbox: 'id, entityType, entityId, createdAt',
      settings: 'id',
      // Maintain legacy aliases mapped to same stores
      captures: 'id, createdAt, status',
      tasks: 'id, reportId, priority, status, dueDate',
    });
  }
}

export const db = new FieldNoteDatabase();

/**
 * Ensures the database is seeded with initial demonstration data on first run
 */
export async function initDatabase(): Promise<void> {
  const reportsCount = await db.reports.count();
  if (reportsCount === 0) {
    await seedDatabase();
  }
}

/**
 * Seeds all collections with realistic field demonstration data
 */
export async function seedDatabase(): Promise<void> {
  const reports = await generateSeedReports();

  await db.transaction(
    'rw',
    [
      db.reports,
      db.findings,
      db.actions,
      db.evidence,
      db.assets,
      db.sites,
      db.transcripts,
      db.templates,
      db.glossary,
      db.settings,
    ],
    async () => {
      await db.reports.clear();
      await db.findings.clear();
      await db.actions.clear();
      await db.evidence.clear();
      await db.assets.clear();
      await db.sites.clear();
      await db.transcripts.clear();
      await db.templates.clear();
      await db.glossary.clear();
      await db.settings.clear();

      await db.sites.bulkAdd(SEED_SITES);
      await db.assets.bulkAdd(SEED_ASSETS);
      await db.templates.bulkAdd(SEED_TEMPLATES);
      await db.glossary.bulkAdd(SEED_GLOSSARY);
      await db.transcripts.bulkAdd(SEED_TRANSCRIPTS);
      await db.findings.bulkAdd(SEED_FINDINGS);
      await db.actions.bulkAdd(SEED_ACTIONS);
      await db.evidence.bulkAdd(SEED_EVIDENCE);
      await db.reports.bulkAdd(reports);
      await db.settings.put(SEED_SETTINGS);
    }
  );
}

/**
 * Resets all demo data to fresh seed state
 */
export async function resetDemoData(): Promise<void> {
  await seedDatabase();
}
