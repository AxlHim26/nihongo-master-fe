import type { Metadata } from "next";

import VocabularyOverview from "@/features/vocabulary/components/vocabulary-overview";

export const metadata: Metadata = {
  title: "Từ vựng",
  description: "Quản lý và luyện tập từ vựng tiếng Nhật",
};

export default function VocabularyPage() {
  return <VocabularyOverview />;
}
