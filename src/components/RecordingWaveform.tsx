import React, { useEffect, useState } from 'react';

export interface RecordingWaveformProps {
  isRecording: boolean;
  barCount?: number;
  height?: number;
}

export const RecordingWaveform: React.FC<RecordingWaveformProps> = ({
  isRecording,
  barCount = 28,
  height = 48,
}) => {
  const [levels, setLevels] = useState<number[]>(
    Array(barCount).fill(0.15)
  );

  useEffect(() => {
    if (!isRecording) {
      setLevels(Array(barCount).fill(0.15));
      return;
    }

    const interval = setInterval(() => {
      setLevels((prev) =>
        prev.map((_, i) => {
          // Dynamic sine-wave fluctuation with random jitter
          const t = Date.now() / 200;
          const sine = Math.sin(t + i * 0.4);
          const rand = Math.random() * 0.4;
          return Math.max(0.15, Math.min(1.0, (sine + 1) / 2 * 0.7 + rand * 0.3));
        })
      );
    }, 80);

    return () => clearInterval(interval);
  }, [isRecording, barCount]);

  return (
    <div
      className="flex items-center justify-center gap-1 w-full overflow-hidden select-none"
      style={{ height: `${height}px` }}
      aria-label="Audio recording waveform visualizer"
    >
      {levels.map((lvl, idx) => (
        <div
          key={idx}
          className={`
            w-1 sm:w-1.5 rounded-full transition-all duration-75
            ${
              isRecording
                ? 'bg-semantic-green shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                : 'bg-border-default opacity-40'
            }
          `}
          style={{
            height: `${Math.max(4, Math.round(lvl * height))}px`,
          }}
        />
      ))}
    </div>
  );
};
