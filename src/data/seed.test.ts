import { describe, it, expect } from 'vitest';
import {
  generateSeedReports,
  SEED_ASSETS,
  SEED_TRANSCRIPTS,
} from './seedData';
import { verifyChain } from '../lib/hashChain';

describe('Seed Data Integrity & Specifications', () => {
  it('generates 10+ realistic field reports across specified sites', async () => {
    const reports = await generateSeedReports();
    expect(reports.length).toBeGreaterThanOrEqual(10);

    const siteNames = reports.map((r) => r.siteName);
    expect(siteNames).toContain('Kukatpally Metro Site');
    expect(siteNames).toContain('Miyapur Depot & Substation');
    expect(siteNames).toContain('Gachibowli Substation Hub');
  });

  it('contains the hero report with exact findings, actions, and priority line', async () => {
    const reports = await generateSeedReports();
    const hero = reports.find((r) => r.isHero);
    expect(hero).toBeDefined();
    if (!hero) return;

    expect(hero.title).toContain('Electrical Inspection');
    expect(hero.createdAt).toBe('2026-09-18T11:42:00.000Z');
    expect(hero.siteName).toBe('Kukatpally Metro Site');
    expect(hero.priority).toBe('high');
    expect(hero.priorityReason).toContain('Critical thermal load and loose terminals pose immediate fire hazard');

    // Panel ID initially missing
    expect(hero.isPanelIdMissing).toBe(true);
    expect(hero.panelId).toBeUndefined();

    // Findings: 3 loose connections, 1 damaged cable insulation
    const looseConnFinding = hero.findings.find((f) => f.text.includes('3 loose connections'));
    expect(looseConnFinding).toBeDefined();
    expect(looseConnFinding?.occurrences).toBe(3);

    const damagedCableFinding = hero.findings.find((f) => f.text.includes('damaged cable insulation'));
    expect(damagedCableFinding).toBeDefined();

    // Two actions with 19 Sep morning deadline
    expect(hero.actions.length).toBe(2);
    hero.actions.forEach((act) => {
      expect(act.dueDate).toContain('2026-09-19');
    });

    // Tamper-evident hash chain in edit history
    expect(hero.editHistory.length).toBe(2);
    const chainVerification = await verifyChain(hero.editHistory);
    expect(chainVerification.valid).toBe(true);
  });

  it('contains PANEL-204 asset with 4 linked reports and recurring loose connection issues', async () => {
    const panel204 = SEED_ASSETS.find((a) => a.tagId === 'PANEL-204');
    expect(panel204).toBeDefined();
    if (!panel204) return;

    expect(panel204.issueHistory.length).toBe(3);
    const recurringIssues = panel204.issueHistory.filter((i) => i.issue.toLowerCase().includes('terminal') || i.issue.toLowerCase().includes('loose'));
    expect(recurringIssues.length).toBeGreaterThanOrEqual(2);

    const reports = await generateSeedReports();
    const panelReports = reports.filter((r) => r.panelId === 'PANEL-204' || r.findings.some((f) => f.assetId === 'asset-panel-204'));
    expect(panelReports.length).toBeGreaterThanOrEqual(4);
  });

  it('includes code-mixed Telugu+English transcript with proper segment offsets', () => {
    const heroTranscript = SEED_TRANSCRIPTS.find((t) => t.reportId === 'rep-hero-001');
    expect(heroTranscript).toBeDefined();
    if (!heroTranscript) return;

    expect(heroTranscript.segments.length).toBe(3);
    expect(heroTranscript.segments[0]?.language).toBe('te');
    expect(heroTranscript.segments[1]?.language).toBe('en');
    expect(heroTranscript.segments[2]?.language).toBe('te');

    // Verify continuous offsets
    for (const segment of heroTranscript.segments) {
      const extracted = heroTranscript.rawText.substring(segment.startChar, segment.endChar);
      expect(extracted).toBe(segment.text);
    }
  });
});
