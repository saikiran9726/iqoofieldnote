/**
 * Privacy Redaction Engine
 * 
 * Complies with Phase 6 (Spec 17):
 * - Privacy mode redacting personnel names and phone numbers
 * - Regex matching for phone numbers (Indian mobile + international)
 * - Known team-member names and glossary personnel terms
 * - Live preview before / after capability
 */

export const DEFAULT_TEAM_NAMES = [
  'K. S. Rao',
  'K. Rao',
  'S. Reddy',
  'P. Ananth',
  'M. Farooq',
  'N. Chari',
  'Chief Inspector V. Murthy',
  'V. Murthy',
  'Field Eng #104',
  'Tech #088',
];

// Phone regex matching:
// - +91 98765 43210, +91-9876543210, 9876543210, +91 94401 23456
// - General international formats: +1-555-123-4567, 555-123-4567
const PHONE_REGEX = /(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}|\b\+?[1-9]\d{0,2}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}\b/g;

/**
 * Escapes regex special characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Redacts phone numbers and team-member names from a text string
 */
export function redactSensitiveText(
  text: string,
  customGlossaryNames: string[] = []
): string {
  if (!text) return '';

  let result = text;

  // 1. Redact phone numbers
  result = result.replace(PHONE_REGEX, '[REDACTED PHONE]');

  // 2. Combine default team names and any supplied glossary names
  const allNames = Array.from(new Set([...DEFAULT_TEAM_NAMES, ...customGlossaryNames])).filter(
    (n) => n && n.trim().length > 1
  );

  // Sort longest names first to prevent partial replacements
  allNames.sort((a, b) => b.length - a.length);

  for (const name of allNames) {
    const pattern = new RegExp(`\\b${escapeRegex(name)}\\b`, 'gi');
    result = result.replace(pattern, '[REDACTED NAME]');
  }

  // 3. Catch common title prefixes: "Inspector John Doe", "Eng. Sharma"
  result = result.replace(
    /\b(Inspector|Officer|Engineer|Eng\.|Technician|Tech)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g,
    '$1 [REDACTED NAME]'
  );

  return result;
}

/**
 * Generates a before/after live preview comparison for UI demonstration
 */
export function generateRedactionPreview(
  sampleText: string,
  customNames: string[] = []
): { before: string; after: string; changesCount: number } {
  const after = redactSensitiveText(sampleText, customNames);
  const nameRedactions = (after.match(/\[REDACTED NAME\]/g) || []).length;
  const phoneRedactions = (after.match(/\[REDACTED PHONE\]/g) || []).length;

  return {
    before: sampleText,
    after,
    changesCount: nameRedactions + phoneRedactions,
  };
}
