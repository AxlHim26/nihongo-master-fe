import type { Metadata } from "next";

import CourseLearningDashboard from "@/features/courses/components/course-learning-dashboard";

export const metadata: Metadata = {
  title: "Khóa học",
  description: "Học theo cây Course → Chapter → Section → Lesson",
};

export default function CoursesPage() {
  return <CourseLearningDashboard />;
}
