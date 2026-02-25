import type { Metadata } from "next";

import PracticeComingSoon from "@/features/practice/components/practice-coming-soon";

export const metadata: Metadata = {
  title: "Shadowing",
  description: "Luyện shadowing tiếng Nhật",
};

export default function PracticeShadowingPage() {
  return <PracticeComingSoon title="Shadowing" />;
}
