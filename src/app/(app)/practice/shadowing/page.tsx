import type { Metadata } from "next";

import PracticeComingSoon from "@/features/practice/components/practice-coming-soon";

export const metadata: Metadata = {
  title: "Shadowing",
  description: "Tính năng Shadowing đang phát triển",
};

export default function PracticeShadowingPage() {
  return <PracticeComingSoon title="Shadowing" />;
}
