export type AudioRecorderErrorType =
  | 'permission_denied'
  | 'not_found'
  | 'busy'
  | 'unsupported'
  | 'unknown';

export type NoiseLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AudioRecorderEvents {
  onWaveformData?: (bars: number[]) => void;
  onNoiseLevel?: (level: NoiseLevel, db: number) => void;
  onDuration?: (durationMs: number) => void;
  onError?: (type: AudioRecorderErrorType, message: string) => void;
}

export class AudioRecorder {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrameId: number | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private pausedDuration: number = 0;
  private pauseStartTime: number = 0;
  private isPaused: boolean = false;
  private events: AudioRecorderEvents;

  constructor(events: AudioRecorderEvents = {}) {
    this.events = events;
  }

  async start(): Promise<boolean> {
    this.audioChunks = [];
    this.pausedDuration = 0;
    this.isPaused = false;

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.events.onError?.('unsupported', 'Audio recording is not supported on this browser/platform.');
      return false;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Initialize Web Audio API Analyser
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        this.analyser.smoothingTimeConstant = 0.8;
        source.connect(this.analyser);
      }

      // Initialize MediaRecorder
      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(this.mediaStream, mimeType ? { mimeType } : undefined);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(250); // Slice every 250ms
      this.startTime = Date.now();
      this.startAnalyserLoop();

      // Trigger haptic vibration if available
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40]);
      }

      return true;
    } catch (err: unknown) {
      const error = err as Error;
      let errorType: AudioRecorderErrorType = 'unknown';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorType = 'permission_denied';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorType = 'not_found';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorType = 'busy';
      }

      this.events.onError?.(errorType, error.message || 'Failed to access microphone.');
      this.cleanup();
      return false;
    }
  }

  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.isPaused = true;
      this.pauseStartTime = Date.now();
    }
  }

  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.isPaused = false;
      this.pausedDuration += Date.now() - this.pauseStartTime;
    }
  }

  async stop(): Promise<{ blob: Blob; durationMs: number }> {
    return new Promise((resolve) => {
      const totalDuration = Date.now() - this.startTime - this.pausedDuration;

      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        const dummyBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanup();
        resolve({ blob: dummyBlob, durationMs: totalDuration });
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const finalBlob = new Blob(this.audioChunks, { type: mimeType });
        this.cleanup();
        resolve({ blob: finalBlob, durationMs: totalDuration });
      };

      this.mediaRecorder.stop();
    });
  }

  cancel(): void {
    this.cleanup();
  }

  private startAnalyserLoop(): void {
    const barCount = 28;
    const dataArray = new Uint8Array(this.analyser?.frequencyBinCount || 32);

    const update = () => {
      if (!this.mediaStream || !this.mediaStream.active) return;

      if (!this.isPaused) {
        const currentDuration = Date.now() - this.startTime - this.pausedDuration;
        this.events.onDuration?.(Math.max(0, currentDuration));

        if (this.analyser) {
          this.analyser.getByteFrequencyData(dataArray);

          // Calculate 28 frequency levels
          const bars: number[] = [];
          let sum = 0;
          for (let i = 0; i < barCount; i++) {
            const index = Math.floor((i / barCount) * dataArray.length);
            const raw = dataArray[index] ?? 0;
            const norm = Math.max(0.1, raw / 255);
            bars.push(norm);
            sum += raw;
          }

          // Calculate RMS & Noise Level
          const avg = sum / dataArray.length;
          let noiseLevel: NoiseLevel = 'LOW';
          if (avg > 110) {
            noiseLevel = 'HIGH';
          } else if (avg > 50) {
            noiseLevel = 'MEDIUM';
          }

          this.events.onWaveformData?.(bars);
          this.events.onNoiseLevel?.(noiseLevel, Math.round(avg));
        }
      }

      this.animationFrameId = requestAnimationFrame(update);
    };

    this.animationFrameId = requestAnimationFrame(update);
  }

  private cleanup(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    this.analyser = null;
    this.mediaRecorder = null;
  }

  private getSupportedMimeType(): string {
    if (typeof MediaRecorder === 'undefined') return '';
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) return t;
    }
    return '';
  }
}
