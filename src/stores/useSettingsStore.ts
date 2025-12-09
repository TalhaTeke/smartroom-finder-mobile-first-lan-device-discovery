import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ScanSettings } from '@/types/settings';
import { defaultSettings } from '@/types/settings';
interface SettingsState {
  settings: ScanSettings;
  updateSettings: (newSettings: Partial<ScanSettings>) => void;
  resetSettings: () => void;
}
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'smartroom-finder-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);