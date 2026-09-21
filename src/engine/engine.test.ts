import { describe, it, expect, vi } from 'vitest';
import { SimulatedEngine } from './simulatedEngine';
import type { EngineProgressEvent } from './types';
import { verifyChain } from '../lib/hashChain';

describe('ReportEngine & SimulatedEngine Pipeline', () => {
  it('exposes engine kind as simulated and not pretending to be NPU or real model', () => {
    const engine = new SimulatedEngine({ instant: true });
    expect(engine.kind).toBe('simulated');
  });

  it('transcribes, extracts, verifies and builds report with ordered progress events', async () => {
    const engine = new SimulatedEngine({ instant: true });
    const progressEvents: EngineProgressEvent[] = [];
    const onProgress = vi.fn((event: EngineProgressEvent) => {
      progressEvents.push(event);
    });

    const report = await engine.buildReport(
      { rawText: 'Test raw voice memo audio text' },
      onProgress
    );

    expect(report).toBeDefined();
    expect(report.findings.length).toBeGreaterThan(0);
    expect(report.actions.length).toBeGreaterThan(0);
    expect(report.priority).toBe('high');

    // Verify hash chain
    expect(report.editHistory.length).toBeGreaterThan(0);
    const verification = await verifyChain(report.editHistory);
    expect(verification.valid).toBe(true);

    // Verify progress sequence
    expect(onProgress).toHaveBeenCalled();
    const stages = progressEvents.map((e) => e.stage);
    expect(stages).toContain('transcribing');
    expect(stages).toContain('extracting');
    expect(stages).toContain('verifying');
    expect(stages).toContain('building');
    expect(stages).toContain('complete');
  });
});
