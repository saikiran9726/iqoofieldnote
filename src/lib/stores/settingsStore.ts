import { create } from 'zustand';
import type { AppSettings, EngineKind } from '../../shared/types';
import { db } from '../../data/db';
import { SEED_SETTINGS } from '../../data/seedData';

interface SettingsStoreState {
  settings: AppSettings;
  loadSettings: () => Promise<void>;
  setEngineKind: (kind: EngineKind) => Promise<void>;
  setSyncEnabled: (enabled: boolean) => Promise<void>;
  setUseOnlineSpeech: (useOnline: boolean) => Promise<void>;
  setPreferredLanguage: (lang: AppSettings['preferredLanguage']) => Promise<void>;
  setVolumeButtonTrigger: (enabled: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  settings: SEED_SETTINGS,

  loadSettings: async () => {
    try {
      const stored = await db.settings.get('current');
      if (stored) {
        const forced = { ...stored, engineKind: 'simulated' as const };
        set({ settings: forced });
        if (stored.engineKind !== 'simulated') {
          await db.settings.put(forced);
        }
      } else {
        const defaultSettings = { ...SEED_SETTINGS, engineKind: 'simulated' as const };
        await db.settings.put(defaultSettings);
        set({ settings: defaultSettings });
      }
    } catch {
      // Fallback
      set({ settings: { ...SEED_SETTINGS, engineKind: 'simulated' } });
    }
  },

  setEngineKind: async (_engineKind) => {
    // Only SimulatedEngine exists in this build; force simulated
    const updated = { ...get().settings, engineKind: 'simulated' as const };
    set({ settings: updated });
    await db.settings.put(updated);
  },

  setSyncEnabled: async (syncEnabled) => {
    const updated = { ...get().settings, syncEnabled };
    set({ settings: updated });
    await db.settings.put(updated);
  },

  setUseOnlineSpeech: async (useOnlineSpeech) => {
    const updated = { ...get().settings, useOnlineSpeech };
    set({ settings: updated });
    await db.settings.put(updated);
  },

  setPreferredLanguage: async (preferredLanguage) => {
    const updated = { ...get().settings, preferredLanguage };
    set({ settings: updated });
    await db.settings.put(updated);
  },

  setVolumeButtonTrigger: async (volumeButtonTrigger) => {
    const updated = { ...get().settings, volumeButtonTrigger };
    set({ settings: updated });
    await db.settings.put(updated);
  },
}));
