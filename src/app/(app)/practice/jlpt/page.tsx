import type { Metadata } from "next";

import JlptDashboard from "@/features/practice/components/jlpt-dashboard";

export const metadata: Metadata = {
  title: "Luyện thi JLPT",
  description: "Hệ thống luyện thi JLPT tương tác, gamification.",
};

export default function PracticeJlptPage() {
  return <JlptDashboard />;
}
