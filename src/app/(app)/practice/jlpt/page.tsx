import type { Metadata } from "next";

import PracticeComingSoon from "@/features/practice/components/practice-coming-soon";

export const metadata: Metadata = {
  title: "Luyện thi JLPT",
  description: "Luyện thi JLPT",
};

export default function PracticeJlptPage() {
  return <PracticeComingSoon title="Luyện thi JLPT" />;
}
