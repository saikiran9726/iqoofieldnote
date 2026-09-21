import Dexie, { type Table } from 'dexie';
import type { CaptureItem, FieldReport, FieldTask, AssetRecord } from '../shared/types';

export class FieldNoteDatabase extends Dexie {
  captures!: Table<CaptureItem, string>;
  reports!: Table<FieldReport, string>;
  tasks!: Table<FieldTask, string>;
  assets!: Table<AssetRecord, string>;

  constructor() {
    super('FieldNoteDB');
    this.version(1).stores({
      captures: 'id, createdAt, status, *tags',
      reports: 'id, createdAt, siteName, inspector',
      tasks: 'id, reportId, priority, status, dueDate',
      assets: 'id, tagId, category, status',
    });
  }
}

export const db = new FieldNoteDatabase();
