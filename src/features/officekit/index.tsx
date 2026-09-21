import React, { useState, useRef } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OfficeKitScreen: React.FC = () => {
  const [teluguSample] = useState<string>('క్షేత్ర స్థాయి నివేదిక: మోటార్ పంపు వైఫల్యం పరిశీలించబడింది.');
  const [hindiSample] = useState<string>('फील्ड निरीक्षण रिपोर्ट: वाल्व बी-12 में दबाव की कमी देखी गई।');
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleRasterizeShaping = () => {
    setIsRendering(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#090B0D';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillText('OFFICEKIT PDF EXPORT ENGINE', 20, 35);

        // Latin
        ctx.fillStyle = '#F1F5F9';
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText('English (Vector Text): Field inspection summary #042', 20, 70);

        // Telugu shaped via browser canvas
        ctx.fillStyle = '#FCD34D';
        ctx.font = '15px "Noto Sans Telugu", sans-serif';
        ctx.fillText(`Telugu: ${teluguSample}`, 20, 110);

        // Hindi shaped via browser canvas
        ctx.fillStyle = '#6EE7B7';
        ctx.font = '15px "Noto Sans Devanagari", sans-serif';
        ctx.fillText(`Hindi: ${hindiSample}`, 20, 150);
      }
    }
    setTimeout(() => setIsRendering(false), 300);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/more" className="p-1.5 rounded-lg bg-bg-surface1 border border-border-default text-text-muted hover:text-text-primary">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-heading-sm font-bold text-text-primary">OfficeKit & Offline PDF Engine</h2>
          <p className="text-metadata text-text-muted">Canvas-assisted Indian script shaping & vector Latin export</p>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-body-sm font-bold text-text-primary">
              Indic Script Shaping Engine (Rule 7b)
            </h3>
            <p className="text-metadata text-text-muted max-w-xl">
              Standard client PDF generators corrupt complex ligatures in Telugu & Devanagari. FieldNote uses the browser's native HarfBuzz text shaper via HTML Canvas rasterization for Indic scripts while keeping Latin text in vector format.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRasterizeShaping}
            disabled={isRendering}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-body-sm font-semibold bg-semantic-green text-text-inverse hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isRendering ? 'Rendering Canvas...' : 'Test Canvas Shaping'}</span>
          </button>
        </div>

        {/* Live Canvas Preview */}
        <div className="p-3 rounded-xl bg-bg-surface2 border border-border-subtle flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={600}
            height={180}
            className="w-full max-w-2xl h-auto rounded-lg border border-border-default bg-[#090B0D]"
          />
          <p className="text-metadata-xs font-mono text-text-muted mt-2">
            Canvas Raster Resolution: 600x180 (Native Browser Font Shaper)
          </p>
        </div>
      </div>
    </div>
  );
};
