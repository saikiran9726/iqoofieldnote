import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, PenTool } from 'lucide-react';
import { Button } from './Button';

export interface SignaturePadProps {
  onSaveSignature?: (dataUrl: string) => void;
  inspectorName?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSaveSignature,
  inspectorName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasSignature, setHasSignature] = useState<boolean>(false);

  const getStrokeColor = () => {
    if (typeof window === 'undefined') return '#10B981';
    try {
      const color = getComputedStyle(document.documentElement).getPropertyValue('--color-green-base').trim();
      return color || '#10B981';
    } catch {
      return '#10B981';
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = getStrokeColor();
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const drawSample = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = getStrokeColor();
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(30, 70);
    ctx.bezierCurveTo(70, 20, 110, 120, 160, 60);
    ctx.bezierCurveTo(190, 30, 220, 90, 280, 50);
    ctx.stroke();
    setHasSignature(true);
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasSignature(true);
    }
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      setIsDrawing(false);
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
      }
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      if (!hasSignature) {
        drawSample();
      }
      const dataUrl = canvas.toDataURL('image/png');
      onSaveSignature?.(dataUrl);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-bg-surface1 border border-border-default space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-semantic-green" />
          <h4 className="text-body-sm font-bold text-text-primary">
            Inspector Sign-Off
          </h4>
        </div>
        {inspectorName && (
          <span className="text-metadata-xs font-mono text-text-muted">
            {inspectorName}
          </span>
        )}
      </div>

      <div className="relative rounded-xl border border-border-strong bg-bg-surface2 overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          width={400}
          height={140}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          className="w-full h-36 cursor-crosshair"
        />

        {!hasSignature && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-text-muted text-metadata font-mono gap-1">
            <span>Draw signature with finger or mouse</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={drawSample}
          className="text-metadata-xs text-text-muted hover:text-semantic-green font-mono underline"
        >
          Use certified signature mark
        </button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={Eraser}
            onClick={handleClear}
            disabled={!hasSignature}
          >
            Clear
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={Check}
            onClick={handleSave}
          >
            Sign & Seal
          </Button>
        </div>
      </div>
    </div>
  );
};

