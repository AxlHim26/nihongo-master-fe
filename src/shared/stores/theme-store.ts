import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import storage from "@/shared/utils/storage";

export type ThemeMode = "light" | "dark" | "system";

type ThemeState = {
  mode: ThemeMode;
  hasHydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setHasHydrated: (value: boolean) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "system",
      hasHydrated: false,
      setMode: (mode) => set({ mode }),
      toggleMode: () => {
        const current = get().mode;
        const next = current === "dark" ? "light" : "dark";
        set({ mode: next });
      },
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "app-theme",
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
