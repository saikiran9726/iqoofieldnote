import { describe, it, expect } from 'vitest';
import {
  GENESIS_HASH,
  createEditHistoryEntry,
  verifyChain,
  canonicalJson,
} from './hashChain';
import type { EditHistoryEntry } from '../shared/types';

describe('Tamper-Evident Hash Chain', () => {
  it('canonicalJson sorts keys predictably', () => {
    const json1 = canonicalJson({ b: 2, a: 1 });
    const json2 = canonicalJson({ a: 1, b: 2 });
    expect(json1).toBe(json2);
    expect(json1).toBe('{"a":1,"b":2}');
  });

  it('creates genesis entry and chained entries with valid verification', async () => {
    const entry1 = await createEditHistoryEntry({
      entityId: 'rep-hero-001',
      entityType: 'report',
      field: 'panelId',
      before: null,
      after: 'PANEL-204',
      prevHash: GENESIS_HASH,
    });

    expect(entry1.prevHash).toBe(GENESIS_HASH);
    expect(entry1.hash).toHaveLength(64);

    const entry2 = await createEditHistoryEntry({
      entityId: 'rep-hero-001',
      entityType: 'report',
      field: 'priority',
      before: 'medium',
      after: 'high',
      prevHash: entry1.hash,
    });

    expect(entry2.prevHash).toBe(entry1.hash);
    expect(entry2.hash).toHaveLength(64);

    const chain: EditHistoryEntry[] = [entry1, entry2];
    const result = await verifyChain(chain);
    expect(result.valid).toBe(true);
    expect(result.tamperedIndex).toBeUndefined();
  });

  it('detects when an entry payload in the chain is tampered with', async () => {
    const entry1 = await createEditHistoryEntry({
      entityId: 'rep-hero-001',
      entityType: 'report',
      field: 'panelId',
      before: null,
      after: 'PANEL-204',
      prevHash: GENESIS_HASH,
    });

    const entry2 = await createEditHistoryEntry({
      entityId: 'rep-hero-001',
      entityType: 'report',
      field: 'priority',
      before: 'medium',
      after: 'high',
      prevHash: entry1.hash,
    });

    // Tamper with entry 1 after value
    const tamperedEntry1 = { ...entry1, after: 'PANEL-999' };
    const tamperedChain: EditHistoryEntry[] = [tamperedEntry1, entry2];

    const result = await verifyChain(tamperedChain);
    expect(result.valid).toBe(false);
    expect(result.tamperedIndex).toBe(0);
    expect(result.error).toContain('Invalid hash signature');
  });

  it('detects when an entry is inserted or prevHash is altered', async () => {
    const entry1 = await createEditHistoryEntry({
      entityId: 'rep-hero-001',
      entityType: 'report',
      field: 'panelId',
      before: null,
      after: 'PANEL-204',
      prevHash: GENESIS_HASH,
    });

    const entry2 = await createEditHistoryEntry({
      entityId: 'rep-hero-001',
      entityType: 'report',
      field: 'priority',
      before: 'medium',
      after: 'high',
      prevHash: '1111111111111111111111111111111111111111111111111111111111111111',
    });

    const brokenChain: EditHistoryEntry[] = [entry1, entry2];
    const result = await verifyChain(brokenChain);
    expect(result.valid).toBe(false);
    expect(result.tamperedIndex).toBe(1);
    expect(result.error).toContain('Broken hash link');
  });
});
