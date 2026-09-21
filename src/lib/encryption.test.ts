import { describe, it, expect, beforeEach } from 'vitest';
import {
  deriveKey,
  encryptPayload,
  decryptPayload,
  testEncryptionRoundTrip,
  hashPasscode,
  saveVaultPackage,
  loadVaultPackage,
  clearVaultPackage,
  type EncryptedPackage,
} from './encryption';

describe('WebCrypto AES-GCM Encrypted Storage Engine', () => {
  const samplePasscode = '4892';
  const sampleReportData = {
    id: 'rep-hero-001',
    siteName: 'Kukatpally Metro Site',
    findings: [
      { text: '3 loose connections observed on Terminal Block B', severity: 'high' },
      { text: 'Damaged cable insulation', severity: 'high' },
    ],
    timestamp: '2026-09-18T11:42:00.000Z',
    auditLedgerSealed: true,
  };

  beforeEach(() => {
    clearVaultPackage();
  });

  it('derives a valid 256-bit AES-GCM CryptoKey using PBKDF2 (100,000 iterations)', async () => {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    const key = await deriveKey(samplePasscode, salt);
    expect(key).toBeDefined();
    expect(key.algorithm.name).toBe('AES-GCM');
    expect((key.algorithm as AesKeyAlgorithm).length).toBe(256);
  });

  it('encrypts data and returns ciphertext, salt, iv in base64 format', async () => {
    const pkg = await encryptPayload(sampleReportData, samplePasscode);
    expect(pkg.algorithm).toBe('AES-GCM-256');
    expect(pkg.iterations).toBe(100000);
    expect(typeof pkg.ciphertext).toBe('string');
    expect(typeof pkg.iv).toBe('string');
    expect(typeof pkg.salt).toBe('string');
    expect(pkg.ciphertext.length).toBeGreaterThan(20);
  });

  it('verifies round-trip: lock -> simulate reload -> unlock -> data intact', async () => {
    // 1. Lock / encrypt
    const encrypted = await encryptPayload(sampleReportData, samplePasscode);
    saveVaultPackage(encrypted);

    // 2. Simulate page reload / state clearance
    const reloadedPkg = loadVaultPackage();
    expect(reloadedPkg).not.toBeNull();
    if (!reloadedPkg) return;

    // 3. Unlock with correct passcode
    const decrypted = await decryptPayload<typeof sampleReportData>(reloadedPkg, samplePasscode);

    // 4. Verify data is 100% intact
    expect(decrypted).toEqual(sampleReportData);
    expect(decrypted.id).toBe('rep-hero-001');
    expect(decrypted.findings.length).toBe(2);
    expect(decrypted.auditLedgerSealed).toBe(true);
  });

  it('testEncryptionRoundTrip helper confirms round-trip fidelity', async () => {
    const isValid = await testEncryptionRoundTrip(sampleReportData, samplePasscode);
    expect(isValid).toBe(true);
  });

  it('rejects decryption when an incorrect passcode is supplied', async () => {
    const encrypted = await encryptPayload(sampleReportData, samplePasscode);
    await expect(decryptPayload(encrypted, 'wrong-pin-9999')).rejects.toThrow(
      /Decryption failed: incorrect passcode or corrupted ciphertext/
    );
  });

  it('rejects decryption when ciphertext has been tampered with', async () => {
    const encrypted = await encryptPayload(sampleReportData, samplePasscode);
    // Tamper with first byte of ciphertext
    const tampered: EncryptedPackage = {
      ...encrypted,
      ciphertext: 'AQIDBA' + encrypted.ciphertext.substring(6),
    };

    await expect(decryptPayload(tampered, samplePasscode)).rejects.toThrow(
      /Decryption failed: incorrect passcode or corrupted ciphertext/
    );
  });

  it('rejects empty passcodes', async () => {
    await expect(encryptPayload(sampleReportData, '')).rejects.toThrow(
      /Cannot encrypt with empty passcode/
    );
    const encrypted = await encryptPayload(sampleReportData, samplePasscode);
    await expect(decryptPayload(encrypted, '')).rejects.toThrow(
      /Cannot decrypt with empty passcode/
    );
  });

  it('hashes passcode consistently with SHA-256', async () => {
    const hash1 = await hashPasscode('1234');
    const hash2 = await hashPasscode('1234');
    const hashDiff = await hashPasscode('5678');
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hashDiff);
  });
});
