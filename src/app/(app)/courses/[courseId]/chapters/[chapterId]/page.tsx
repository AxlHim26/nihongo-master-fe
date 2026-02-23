import type { Metadata } from "next";

import CourseSectionsPage from "@/features/courses/components/course-sections-page";

type CourseChapterPageProps = {
  params: Promise<{
    courseId: string;
    chapterId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Mục học",
  description: "Chọn mục học trong chương",
};

export default async function CourseChapterPage({ params }: CourseChapterPageProps) {
  const { courseId, chapterId } = await params;
  return <CourseSectionsPage courseId={courseId} chapterId={chapterId} />;
}
