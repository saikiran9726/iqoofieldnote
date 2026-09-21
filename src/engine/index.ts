import { SimulatedEngine } from './simulatedEngine';
import type { ReportEngine } from './types';

export * from './types';
export * from './simulatedEngine';

// Default application engine instance (Simulated by default in Phase 1)
export const defaultEngine: ReportEngine = new SimulatedEngine({
  stepDelayMs: 120,
  instant: false,
});
