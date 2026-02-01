import type { Metadata } from "next";

import CoursesOverview from "@/features/courses/components/courses-overview";

export const metadata: Metadata = {
  title: "Khóa học",
  description: "Lộ trình học tập theo mục tiêu JLPT",
};

export default function CoursesPage() {
  return <CoursesOverview />;
}
