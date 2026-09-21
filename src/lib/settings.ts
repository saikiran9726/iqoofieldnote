import { create } from 'zustand';
import type { SpeechSettings } from '../shared/types';

interface SettingsState {
  speech: SpeechSettings;
  setUseOnlineSpeech: (useOnline: boolean) => void;
  setLanguage: (lang: SpeechSettings['preferredLanguage']) => void;
  setVolumeButtonTrigger: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  speech: {
    useOnlineSpeech: false, // OFF by default per Rule 7a
    preferredLanguage: 'en-US',
    volumeButtonTrigger: false,
  },
  setUseOnlineSpeech: (useOnline: boolean) =>
    set((state) => ({
      speech: { ...state.speech, useOnlineSpeech: useOnline },
    })),
  setLanguage: (lang) =>
    set((state) => ({
      speech: { ...state.speech, preferredLanguage: lang },
    })),
  setVolumeButtonTrigger: (enabled) =>
    set((state) => ({
      speech: { ...state.speech, volumeButtonTrigger: enabled },
    })),
}));
