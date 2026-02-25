import type { Metadata } from "next";

import PracticeComingSoon from "@/features/practice/components/practice-coming-soon";

export const metadata: Metadata = {
  title: "Nghe",
  description: "Luyện nghe tiếng Nhật",
};

export default function PracticeListeningPage() {
  return <PracticeComingSoon title="Nghe" />;
}
