import React, { useEffect, useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState, AssetCard, Button } from '../../components';
import type { Asset } from '../../shared/types';
import { db, resetDemoData } from '../../data/db';

export { AssetDetailScreen } from './AssetDetail';

export const AssetsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);

  const loadAssets = async () => {
    const list = await db.assets.toArray();
    setAssets(list);
  };

  useEffect(() => {
    loadAssets();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link to="/more" className="p-2 rounded-xl bg-bg-surface1 border border-border-default text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-heading-sm font-bold text-text-primary">Asset Inventory</h2>
            <p className="text-metadata text-text-muted">Local equipment records and recurring issue history</p>
          </div>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={async () => {
            await resetDemoData();
            await loadAssets();
          }}
        >
          Reset Assets
        </Button>
      </div>

      {assets.length === 0 ? (
        <EmptyState
          icon={Plus}
          badge="No Assets Indexed"
          title="Asset Inventory Empty"
          description="Track equipment tags, maintenance logs, and sensor specs locally on this device. Scan QR codes or create new asset entries."
          actions={[
            {
              label: 'Load Sample Assets',
              icon: Plus,
              onClick: async () => {
                await resetDemoData();
                await loadAssets();
              },
              variant: 'primary',
            },
          ]}
        />
      ) : (
        <div className="space-y-3.5">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onClick={() => {
                navigate(`/assets/${asset.tagId}`);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
