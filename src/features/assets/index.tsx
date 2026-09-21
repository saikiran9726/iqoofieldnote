import React, { useState } from 'react';
import { Database, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import type { AssetRecord } from '../../shared/types';

export const AssetsScreen: React.FC = () => {
  const [assets, setAssets] = useState<AssetRecord[]>([]);

  const handleCreateSampleAsset = () => {
    const sample: AssetRecord = {
      id: `ast-${Date.now()}`,
      tagId: 'PUMP-HYD-042',
      name: 'High-Pressure Hydraulic Feed Pump',
      category: 'Pumping Systems',
      lastInspected: new Date().toISOString(),
      status: 'operational',
    };
    setAssets([sample, ...assets]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/more" className="p-1.5 rounded-lg bg-bg-surface1 border border-border-default text-text-muted hover:text-text-primary">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-heading-sm font-bold text-text-primary">Asset Inventory</h2>
          <p className="text-metadata text-text-muted">Local equipment records and QR barcode mapping</p>
        </div>
      </div>

      {assets.length === 0 ? (
        <EmptyState
          icon={Database}
          badge="No Assets Indexed"
          title="Asset Inventory Empty"
          description="Track equipment tags, maintenance logs, and sensor specs locally on this device. Scan QR codes or create new asset entries."
          actions={[
            {
              label: 'Add Sample Equipment',
              icon: Plus,
              onClick: handleCreateSampleAsset,
              variant: 'primary',
            },
          ]}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCreateSampleAsset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-semantic-green text-text-inverse text-metadata font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Asset</span>
            </button>
          </div>

          {assets.map((asset) => (
            <div
              key={asset.id}
              className="p-4 rounded-xl bg-bg-surface1 border border-border-default flex items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-metadata-xs font-bold px-2 py-0.5 rounded bg-bg-surface2 text-semantic-blue border border-border-subtle">
                    {asset.tagId}
                  </span>
                  <span className="text-metadata text-text-muted">{asset.category}</span>
                </div>
                <h4 className="text-body-sm font-semibold text-text-primary">{asset.name}</h4>
              </div>

              <span className="px-2.5 py-1 rounded-full text-metadata-xs font-mono font-semibold uppercase bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border">
                {asset.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
