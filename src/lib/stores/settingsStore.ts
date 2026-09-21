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
        set({ settings: stored });
      } else {
        await db.settings.put(SEED_SETTINGS);
        set({ settings: SEED_SETTINGS });
      }
    } catch {
      // Fallback
      set({ settings: SEED_SETTINGS });
    }
  },

  setEngineKind: async (engineKind) => {
    const updated = { ...get().settings, engineKind };
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
