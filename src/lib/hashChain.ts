import type { EditHistoryEntry } from '../shared/types';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Deterministic JSON stringifier with sorted object keys
 */
export function canonicalJson(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJson).join(',') + ']';
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map((key) => {
    const val = (obj as Record<string, unknown>)[key];
    return JSON.stringify(key) + ':' + canonicalJson(val);
  });
  return '{' + pairs.join(',') + '}';
}

/**
 * Computes SHA-256 hex string using Web Crypto API
 */
export async function sha256Hex(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web Crypto SubtleCrypto is not available in this environment');
  }
  const hashBuffer = await subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Computes the hash for an edit history entry
 */
export async function computeEntryHash(
  prevHash: string,
  entryData: {
    id: string;
    entityId: string;
    entityType: string;
    field: string;
    before: unknown;
    after: unknown;
    timestamp: string;
  }
): Promise<string> {
  const payload = prevHash + ':' + canonicalJson(entryData);
  return sha256Hex(payload);
}

/**
 * Creates a validated, tamper-evident edit history entry
 */
export async function createEditHistoryEntry(params: {
  id?: string;
  entityId: string;
  entityType: EditHistoryEntry['entityType'];
  field: string;
  before: unknown;
  after: unknown;
  prevHash?: string;
  timestamp?: string;
}): Promise<EditHistoryEntry> {
  const id = params.id || `edit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const timestamp = params.timestamp || new Date().toISOString();
  const prevHash = params.prevHash || GENESIS_HASH;

  const dataPayload = {
    id,
    entityId: params.entityId,
    entityType: params.entityType,
    field: params.field,
    before: params.before,
    after: params.after,
    timestamp,
  };

  const hash = await computeEntryHash(prevHash, dataPayload);

  return {
    id,
    entityId: params.entityId,
    entityType: params.entityType,
    field: params.field,
    before: params.before,
    after: params.after,
    timestamp,
    prevHash,
    hash,
  };
}

/**
 * Verifies the integrity of an edit history chain
 */
export async function verifyChain(
  chain: EditHistoryEntry[]
): Promise<{ valid: boolean; tamperedIndex?: number; error?: string }> {
  if (!chain || chain.length === 0) {
    return { valid: true };
  }

  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < chain.length; i++) {
    const entry = chain[i];
    if (!entry) continue;

    if (entry.prevHash !== expectedPrevHash) {
      return {
        valid: false,
        tamperedIndex: i,
        error: `Broken hash link at index ${i}: expected prevHash ${expectedPrevHash} but found ${entry.prevHash}`,
      };
    }

    const computedHash = await computeEntryHash(entry.prevHash, {
      id: entry.id,
      entityId: entry.entityId,
      entityType: entry.entityType,
      field: entry.field,
      before: entry.before,
      after: entry.after,
      timestamp: entry.timestamp,
    });

    if (computedHash !== entry.hash) {
      return {
        valid: false,
        tamperedIndex: i,
        error: `Invalid hash signature at index ${i}: recorded hash ${entry.hash} does not match computed hash ${computedHash}`,
      };
    }

    expectedPrevHash = entry.hash;
  }

  return { valid: true };
}

/**
 * Recomputes the entire hash chain from the first entry to restore cryptographic integrity
 */
export async function recomputeChain(
  chain: EditHistoryEntry[]
): Promise<EditHistoryEntry[]> {
  if (!chain || chain.length === 0) return [];

  let currentPrevHash = GENESIS_HASH;
  const newChain: EditHistoryEntry[] = [];

  for (const entry of chain) {
    const dataPayload = {
      id: entry.id,
      entityId: entry.entityId,
      entityType: entry.entityType,
      field: entry.field,
      before: entry.before,
      after: entry.after,
      timestamp: entry.timestamp,
    };

    const newHash = await computeEntryHash(currentPrevHash, dataPayload);
    const updatedEntry: EditHistoryEntry = {
      ...entry,
      prevHash: currentPrevHash,
      hash: newHash,
    };

    newChain.push(updatedEntry);
    currentPrevHash = newHash;
  }

  return newChain;
}

