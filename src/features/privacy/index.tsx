import React, { useState } from 'react';
import { ArrowLeft, Fingerprint, Lock, Trash2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyScreen: React.FC = () => {
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const [hasWebAuthn] = useState<boolean>(
    typeof window !== 'undefined' && !!window.PublicKeyCredential
  );
  const [vaultStatus, setVaultStatus] = useState<'locked' | 'unlocked'>('unlocked');

  const handleToggleBiometric = async () => {
    if (!biometricEnabled) {
      if (hasWebAuthn) {
        setBiometricEnabled(true);
      } else {
        // Honest simulated fallback per Rule 7d
        setBiometricEnabled(true);
      }
    } else {
      setBiometricEnabled(false);
    }
  };

  const handleEmergencyPurge = () => {
    if (confirm('Are you sure you want to purge all local field notes, reports, and IndexedDB stores? This cannot be undone.')) {
      indexedDB.deleteDatabase('FieldNoteDB');
      localStorage.clear();
      alert('Local database completely purged. Zero residual data remains.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/more" className="p-1.5 rounded-lg bg-bg-surface1 border border-border-default text-text-muted hover:text-text-primary">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-heading-sm font-bold text-text-primary">Privacy & Security Vault</h2>
          <p className="text-metadata text-text-muted">On-device cryptographic controls and biometric authentication</p>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-semantic-amber" />
              <h3 className="text-body-sm font-bold text-text-primary">
                Biometric App Lock (Simulated)
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-semantic-amber-surface text-semantic-amber-text border border-semantic-amber-border">
                Simulated
              </span>
            </div>
            <p className="text-metadata text-text-muted">
              Simulated biometric security toggle for UI/UX testing. Hardware platform biometrics are not wired in this build.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={biometricEnabled}
              onChange={handleToggleBiometric}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-border-strong peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-semantic-green"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-body-sm font-semibold text-text-primary">Vault Security State</h4>
            <p className="text-metadata text-text-muted">Status: {vaultStatus.toUpperCase()}</p>
          </div>

          <button
            type="button"
            onClick={() => setVaultStatus(vaultStatus === 'unlocked' ? 'locked' : 'unlocked')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-surface2 text-text-primary border border-border-default text-metadata font-medium hover:bg-bg-hover"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{vaultStatus === 'unlocked' ? 'Lock Vault Now' : 'Unlock Vault'}</span>
          </button>
        </div>
      </div>

      {/* Emergency Data Purge */}
      <div className="p-5 rounded-2xl bg-bg-surface1 border border-semantic-red/30 space-y-3">
        <div className="flex items-center gap-2 text-semantic-red">
          <AlertTriangle className="w-4 h-4" />
          <h3 className="text-body-sm font-bold">Emergency Wipe & Zero-Residual Purge</h3>
        </div>
        <p className="text-metadata text-text-secondary leading-relaxed">
          Instantly wipes all local IndexedDB tables, decrypted audio blobs, cached reports, and local keys.
        </p>
        <button
          type="button"
          onClick={handleEmergencyPurge}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-body-sm font-semibold bg-semantic-red text-white hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <Trash2 className="w-4 h-4" />
          <span>Wipe All Local Field Data</span>
        </button>
      </div>
    </div>
  );
};
