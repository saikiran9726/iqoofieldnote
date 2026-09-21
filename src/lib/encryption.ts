/**
 * WebCrypto AES-GCM 256-bit Encrypted Storage Engine
 * 
 * Complies with Phase 6 (Spec 17):
 * - Key derived from passcode via PBKDF2 (100,000 iterations, SHA-256)
 * - 256-bit AES-GCM authenticated encryption with 96-bit random IV and 128-bit random salt
 * - Zero external dependencies (uses native globalThis.crypto.subtle)
 * - Complete round-trip guarantee: lock -> reload -> unlock -> data intact
 */

export interface EncryptedPackage {
  ciphertext: string; // Base64
  iv: string; // Base64 (12 bytes)
  salt: string; // Base64 (16 bytes)
  algorithm: 'AES-GCM-256';
  iterations: number;
  timestamp: string;
}

const VAULT_STORAGE_KEY = 'fieldnote_encrypted_vault_pkg';
const PASSCODE_HASH_KEY = 'fieldnote_passcode_hash';

/**
 * Encodes Uint8Array to base64
 */
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return btoa(binary);
}

/**
 * Decodes base64 to Uint8Array
 */
function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i) || 0;
  }
  return bytes;
}

/**
 * Derives a 256-bit AES-GCM CryptoKey from a passcode using PBKDF2
 */
export async function deriveKey(passcode: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passcode),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts arbitrary data using WebCrypto AES-GCM derived from the passcode
 */
export async function encryptPayload(data: unknown, passcode: string): Promise<EncryptedPackage> {
  if (!passcode || passcode.trim().length === 0) {
    throw new Error('Cannot encrypt with empty passcode');
  }

  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);

  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const key = await deriveKey(passcode, salt);
  const jsonStr = JSON.stringify(data);
  const encodedData = new TextEncoder().encode(jsonStr);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    encodedData as unknown as BufferSource
  );

  return {
    ciphertext: uint8ToBase64(new Uint8Array(ciphertextBuffer)),
    iv: uint8ToBase64(iv),
    salt: uint8ToBase64(salt),
    algorithm: 'AES-GCM-256',
    iterations: 100000,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Decrypts an EncryptedPackage using the passcode
 */
export async function decryptPayload<T = unknown>(
  pkg: EncryptedPackage,
  passcode: string
): Promise<T> {
  if (!passcode || passcode.trim().length === 0) {
    throw new Error('Cannot decrypt with empty passcode');
  }

  try {
    const salt = base64ToUint8(pkg.salt);
    const iv = base64ToUint8(pkg.iv);
    const ciphertext = base64ToUint8(pkg.ciphertext);

    const key = await deriveKey(passcode, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      key,
      ciphertext as unknown as BufferSource
    );

    const jsonStr = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(jsonStr) as T;
  } catch {
    throw new Error('Decryption failed: incorrect passcode or corrupted ciphertext');
  }
}

/**
 * Hashes a passcode with SHA-256 for local quick-validation
 */
export async function hashPasscode(passcode: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`salt_fn_${passcode}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return uint8ToBase64(new Uint8Array(hashBuffer));
}

/**
 * Verifies encryption round-trip: encrypts data, clears references, decrypts, and checks equality
 */
export async function testEncryptionRoundTrip(
  sampleData: unknown,
  passcode: string
): Promise<boolean> {
  const encrypted = await encryptPayload(sampleData, passcode);
  const decrypted = await decryptPayload(encrypted, passcode);
  return JSON.stringify(sampleData) === JSON.stringify(decrypted);
}

// In-memory fallback for test / non-browser environments
const memoryStore: Record<string, string> = {};

function getStorageItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem(key);
  }
  return memoryStore[key] ?? null;
}

function setStorageItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(key, value);
  }
  memoryStore[key] = value;
}

function removeStorageItem(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(key);
  }
  delete memoryStore[key];
}

/**
 * Vault persistence helpers
 */
export function saveVaultPackage(pkg: EncryptedPackage): void {
  setStorageItem(VAULT_STORAGE_KEY, JSON.stringify(pkg));
}

export function loadVaultPackage(): EncryptedPackage | null {
  const raw = getStorageItem(VAULT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EncryptedPackage;
  } catch {
    return null;
  }
}

export function clearVaultPackage(): void {
  removeStorageItem(VAULT_STORAGE_KEY);
}

export function savePasscodeHash(hash: string): void {
  setStorageItem(PASSCODE_HASH_KEY, hash);
}

export function getPasscodeHash(): string | null {
  return getStorageItem(PASSCODE_HASH_KEY);
}

export function clearPasscode(): void {
  removeStorageItem(PASSCODE_HASH_KEY);
  removeStorageItem(VAULT_STORAGE_KEY);
}

export function isPasscodeConfigured(): boolean {
  return !!getPasscodeHash();
}
