import { create } from "zustand";

export type VocabularySort = "recent" | "alphabet";

type VocabularyState = {
  sort: VocabularySort;
  setSort: (sort: VocabularySort) => void;
};

export const useVocabularyStore = create<VocabularyState>((set) => ({
  sort: "recent",
  setSort: (sort) => set({ sort }),
}));
