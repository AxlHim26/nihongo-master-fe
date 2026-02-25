import type { Metadata } from "next";

import PracticeComingSoon from "@/features/practice/components/practice-coming-soon";

export const metadata: Metadata = {
  title: "Thử thách 50 ngày",
  description: "Lộ trình luyện tập 50 ngày",
};

export default function PracticeChallengePage() {
  return <PracticeComingSoon title="Thử thách 50 ngày" />;
}
