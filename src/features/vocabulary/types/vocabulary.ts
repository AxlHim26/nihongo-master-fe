export type VocabularySet = {
  id: string;
  title: string;
  wordCount: number;
  updatedAt: string;
  isCommunity?: boolean;
  isNew?: boolean;
};

export type VocabularyLibrary = {
  sets: VocabularySet[];
  limit: number;
};
