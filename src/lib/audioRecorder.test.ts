import { describe, it, expect, vi } from 'vitest';
import { AudioRecorder, type AudioRecorderErrorType } from './audioRecorder';

describe('AudioRecorder & Noise Analyzer', () => {
  it('instantiates cleanly with event callbacks', () => {
    const onNoise = vi.fn();
    const recorder = new AudioRecorder({ onNoiseLevel: onNoise });
    expect(recorder).toBeDefined();
  });

  it('handles unsupported audio environment gracefully', async () => {
    let capturedError: AudioRecorderErrorType | null = null;
    const recorder = new AudioRecorder({
      onError: (type) => {
        capturedError = type;
      },
    });

    // In node/vitest environment without Web Audio hardware, should catch unsupported or not_found
    const success = await recorder.start();
    expect(success).toBe(false);
    expect(['unsupported', 'unknown', 'not_found']).toContain(capturedError);
  });
});
