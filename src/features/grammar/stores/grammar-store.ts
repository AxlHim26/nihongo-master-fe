import { create } from "zustand";

import type { GrammarLevel, GrammarPoint } from "@/features/grammar/types/grammar";

type GrammarState = {
  selectedLevelId: string | null;
  selectedPointId: string | null;
  setSelectedLevelId: (id: GrammarLevel["id"]) => void;
  setSelectedPointId: (id: GrammarPoint["id"]) => void;
};

export const useGrammarStore = create<GrammarState>((set) => ({
  selectedLevelId: null,
  selectedPointId: null,
  setSelectedLevelId: (id) => set({ selectedLevelId: id }),
  setSelectedPointId: (id) => set({ selectedPointId: id }),
}));
