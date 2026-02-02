import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import storage from "@/shared/utils/storage";

type LayoutState = {
  sidebarOpen: boolean;
  commandOpen: boolean;
  immersiveMode: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCommandOpen: (open: boolean) => void;
  setImmersiveMode: (value: boolean) => void;
  setHasHydrated: (value: boolean) => void;
  hasHydrated: boolean;
};

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      commandOpen: false,
      immersiveMode: false,
      hasHydrated: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setCommandOpen: (open) => set({ commandOpen: open }),
      setImmersiveMode: (value) => set({ immersiveMode: value }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "app-layout",
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
