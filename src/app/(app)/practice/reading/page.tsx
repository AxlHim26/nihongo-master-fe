import type { Metadata } from "next";

import PracticeReadingView from "@/features/practice/components/practice-reading-view";

export const metadata: Metadata = {
  title: "Luyện đọc",
  description: "AI tạo bài đọc tiếng Nhật và câu hỏi trắc nghiệm theo trình độ",
};

export default function PracticeReadingPage() {
  return <PracticeReadingView />;
}
