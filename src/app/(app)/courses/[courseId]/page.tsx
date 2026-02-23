import type { Metadata } from "next";

import CourseChaptersPage from "@/features/courses/components/course-chapters-page";

type CoursePageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Chương học",
  description: "Danh sách chương theo khóa học",
};

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;
  return <CourseChaptersPage courseId={courseId} />;
}
