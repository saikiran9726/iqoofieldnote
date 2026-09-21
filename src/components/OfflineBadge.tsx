import React, { useState, useEffect } from 'react';
import { ShieldCheck, CloudLightning, WifiOff, Globe } from 'lucide-react';
import { useSettingsStore } from '../lib/settings';

export const OfflineBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const useOnlineSpeech = useSettingsStore((s) => s.speech.useOnlineSpeech);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (useOnlineSpeech && isOnline) {
    return (
      <div 
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-metadata font-medium bg-semantic-amber-surface text-semantic-amber-text border border-semantic-amber-border select-none transition-colors"
        title="Online Speech is enabled and uses your browser's external speech service"
      >
        <CloudLightning className="w-3.5 h-3.5 animate-pulse" />
        <span>Online Speech Active</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div 
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-metadata font-medium bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border select-none transition-colors"
        title="100% Offline Mode — Zero network activity"
      >
        <WifiOff className="w-3.5 h-3.5" />
        <span>Field Offline Mode</span>
      </div>
    );
  }

  return (
    <div 
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-metadata font-medium bg-bg-surface2 text-text-secondary border border-border-default select-none hover:border-border-strong transition-colors"
      title="Offline-First Core — Local on-device storage & intelligence"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-semantic-green" />
      <span className="flex items-center gap-1">
        <span>Offline Core</span>
        <Globe className="w-3 h-3 text-text-muted opacity-60" />
      </span>
    </div>
  );
};
