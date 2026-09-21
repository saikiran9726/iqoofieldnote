import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  X,
  Mic,
  SlidersHorizontal,
  HelpCircle,
  ShieldCheck,
  Download,
  ListTodo,
  Database,
} from 'lucide-react';
import { resetDemoData, db } from '../data/db';
import { generateReportPdf, downloadOrShareFile } from '../lib/exportEngine';

interface DemoStep {
  id: number;
  title: string;
  description: string;
  route: string;
  icon: React.ElementType;
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    title: '1. Capture Home',
    description: 'Central dominant microphone with offline badge & Daylight toggle.',
    route: '/capture',
    icon: Mic,
  },
  {
    id: 2,
    title: '2. Live Audio Recording',
    description: 'Real frequency waveform, noise meter, and Telugu+English code-mixed transcript stream.',
    route: '/capture',
    icon: Mic,
  },
  {
    id: 3,
    title: '3. Staggered Pipeline',
    description: '4-stage extraction pipeline: Listening, Extracting, Verifying, Building.',
    route: '/capture',
    icon: Sparkles,
  },
  {
    id: 4,
    title: '4. Structured Report Editor',
    description: 'Auto-compiled inspection dossier with confidence breakdown and inline tap-to-edit.',
    route: '/reports/rep-hero-001',
    icon: SlidersHorizontal,
  },
  {
    id: 5,
    title: '5. Missing Entity Resolution',
    description: 'Sliding QuestionCard prompt resolving missing Panel ID to PANEL-204.',
    route: '/reports/rep-hero-001',
    icon: HelpCircle,
  },
  {
    id: 6,
    title: '6. Photographic Evidence & Seal',
    description: 'Attached photo evidence and ISO-19011 cryptographic sign-off seal.',
    route: '/reports/rep-hero-001',
    icon: ShieldCheck,
  },
  {
    id: 7,
    title: '7. Real On-Device PDF Export',
    description: 'Generates on-device PDF with canvas-rasterized Indic text and SHA-256 seal.',
    route: '/reports/rep-hero-001',
    icon: Download,
  },
  {
    id: 8,
    title: '8. Tasks & Action Items',
    description: 'Extracted remediation tasks synced to punch list with reminder notifications.',
    route: '/tasks',
    icon: ListTodo,
  },
  {
    id: 9,
    title: '9. PANEL-204 Asset History',
    description: 'Equipment dossier tracking 4 linked reports and 3x recurring loose connection hazard.',
    route: '/assets/PANEL-204',
    icon: Database,
  },
];

export const DemoTour: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const navigate = useNavigate();

  const currentStep = DEMO_STEPS[currentStepIdx] ?? DEMO_STEPS[0]!;

  const handleGoToStep = async (stepIdx: number) => {
    setCurrentStepIdx(stepIdx);
    const step = DEMO_STEPS[stepIdx];
    if (step) {
      if (step.id === 7) {
        navigate(step.route);
        try {
          const heroReport = await db.reports.get('rep-hero-001');
          if (heroReport) {
            const { blob, filename } = await generateReportPdf(heroReport);
            await downloadOrShareFile({ blob, filename, mimeType: 'application/pdf' });
          }
        } catch (e) {
          console.error('PDF export error:', e);
        }
      } else {
        navigate(step.route);
      }
    }
  };

  const handleNext = () => {
    if (currentStepIdx < DEMO_STEPS.length - 1) {
      handleGoToStep(currentStepIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      handleGoToStep(currentStepIdx - 1);
    }
  };

  const handleReset = async () => {
    await resetDemoData();
    handleGoToStep(0);
  };

  return (
    <>
      {/* Floating Demo Tour Trigger */}
      <button
        type="button"
        id="demo-tour-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-40 px-3 py-2 rounded-xl bg-semantic-green text-white font-mono font-bold text-metadata-xs shadow-lg flex items-center gap-1.5 hover:scale-105 transition-all border border-white/20"
        title="Open 9-step Demo Tour walkthrough"
      >
        <Sparkles className="w-4 h-4 animate-pulse" />
        <span>DEMO TOUR</span>
      </button>

      {/* Demo Tour Drawer / Bar */}
      {isOpen && (
        <div
          id="demo-tour-panel"
          className="fixed bottom-0 inset-x-0 z-50 p-4 bg-bg-surface1/95 backdrop-blur-md border-t border-border-default shadow-2xl transition-all"
        >
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border">
                  Offline Demo Tour
                </span>
                <span className="text-body-xs font-bold text-text-primary">
                  Step {currentStep.id} of {DEMO_STEPS.length}: {currentStep.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="demo-reset-button"
                  onClick={handleReset}
                  className="px-2.5 py-1 rounded-lg text-metadata-xs font-mono text-text-muted hover:text-text-primary flex items-center gap-1 hover:bg-bg-surface2 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface2 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-body-xs text-text-secondary">
              {currentStep.description}
            </p>

            {/* Stepper Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border-subtle">
              <div className="flex items-center gap-1 overflow-x-auto py-1">
                {DEMO_STEPS.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleGoToStep(idx)}
                    className={`
                      px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all shrink-0
                      ${
                        currentStepIdx === idx
                          ? 'bg-semantic-green text-white shadow-sm'
                          : 'bg-bg-surface2 text-text-muted hover:text-text-primary'
                      }
                    `}
                  >
                    Step {s.id}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStepIdx === 0}
                  className="px-3 py-1.5 rounded-xl bg-bg-surface2 text-text-primary font-mono text-metadata-xs font-semibold disabled:opacity-40 flex items-center gap-1 border border-border-subtle hover:bg-bg-hover transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <button
                  type="button"
                  id="demo-next-step-button"
                  onClick={handleNext}
                  disabled={currentStepIdx === DEMO_STEPS.length - 1}
                  className="px-3.5 py-1.5 rounded-xl bg-semantic-green text-white font-mono text-metadata-xs font-bold disabled:opacity-40 flex items-center gap-1 shadow hover:brightness-110 transition-all"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
