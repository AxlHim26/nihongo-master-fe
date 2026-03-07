import type { Metadata } from "next";

import PracticeJlptView from "@/features/practice/components/practice-jlpt-view";

export const metadata: Metadata = {
  title: "Luyện thi JLPT",
  description: "Thi thử JLPT sát đề thật với lưu tiến trình và chấm điểm",
};

export default function PracticeJlptPage() {
  return <PracticeJlptView />;
}
