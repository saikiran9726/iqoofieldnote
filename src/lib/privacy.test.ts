import { describe, it, expect } from 'vitest';
import { redactSensitiveText, generateRedactionPreview } from './privacy';

describe('Privacy Redaction Engine', () => {
  it('redacts Indian mobile phone numbers with and without country code', () => {
    const input = 'Call K. S. Rao at +91 98765 43210 or 9440123456 immediately.';
    const output = redactSensitiveText(input);
    expect(output).toContain('[REDACTED PHONE]');
    expect(output).not.toContain('98765');
    expect(output).not.toContain('9440123456');
  });

  it('redacts known team-member names and field engineer IDs', () => {
    const input = 'Report filed by K. S. Rao with S. Reddy and P. Ananth.';
    const output = redactSensitiveText(input);
    expect(output).not.toContain('K. S. Rao');
    expect(output).not.toContain('S. Reddy');
    expect(output).not.toContain('P. Ananth');
    expect(output).toContain('[REDACTED NAME]');
  });

  it('incorporates custom team-member names from glossary', () => {
    const input = 'Inspected by Vikramaditya on site.';
    const customGlossary = ['Vikramaditya'];
    const output = redactSensitiveText(input, customGlossary);
    expect(output).toBe('Inspected by [REDACTED NAME] on site.');
  });

  it('generates before/after live preview comparison with modification counters', () => {
    const sample = 'Inspector K. S. Rao phoned +91 98765 43210 regarding breaker repair.';
    const preview = generateRedactionPreview(sample);
    expect(preview.before).toBe(sample);
    expect(preview.after).toContain('[REDACTED NAME]');
    expect(preview.after).toContain('[REDACTED PHONE]');
    expect(preview.changesCount).toBeGreaterThanOrEqual(2);
  });
});
