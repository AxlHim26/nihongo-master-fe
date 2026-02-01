import type { VocabularyLibrary, VocabularySet } from "@/features/vocabulary/types/vocabulary";

export const vocabularySets: VocabularySet[] = [
  {
    id: "set-1",
    title: "Bài 12 - Chủ đề trường học",
    wordCount: 38,
    updatedAt: "2024-06-15T08:30:00.000Z",
    isCommunity: true,
    isNew: true,
  },
  {
    id: "set-2",
    title: "Bài 11 - Công việc",
    wordCount: 42,
    updatedAt: "2024-06-02T10:20:00.000Z",
    isCommunity: true,
  },
  {
    id: "set-3",
    title: "Bài 10 - Sở thích",
    wordCount: 28,
    updatedAt: "2024-05-20T09:00:00.000Z",
    isCommunity: true,
  },
  {
    id: "set-4",
    title: "Bài 9 - Đồ ăn",
    wordCount: 31,
    updatedAt: "2024-05-10T09:00:00.000Z",
    isCommunity: true,
  },
  {
    id: "set-5",
    title: "Bài 8 - Gia đình",
    wordCount: 26,
    updatedAt: "2024-05-01T09:00:00.000Z",
    isCommunity: true,
  },
];

export const vocabularyLibrary: VocabularyLibrary = {
  sets: [],
  limit: 5,
};
