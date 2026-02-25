import type { Metadata } from "next";

import PracticeComingSoon from "@/features/practice/components/practice-coming-soon";

export const metadata: Metadata = {
  title: "Đọc",
  description: "Luyện đọc tiếng Nhật",
};

export default function PracticeReadingPage() {
  return <PracticeComingSoon title="Đọc" />;
}
