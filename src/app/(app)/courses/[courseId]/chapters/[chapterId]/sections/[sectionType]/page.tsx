import type { Metadata } from "next";

import CourseLessonsPage from "@/features/courses/components/course-lessons-page";

type CourseSectionPageProps = {
  params: Promise<{
    courseId: string;
    chapterId: string;
    sectionType: string;
  }>;
};

export const metadata: Metadata = {
  title: "Bài học",
  description: "Danh sách bài học trong mục",
};

export default async function CourseSectionPage({ params }: CourseSectionPageProps) {
  const { courseId, chapterId, sectionType } = await params;
  return <CourseLessonsPage courseId={courseId} chapterId={chapterId} sectionType={sectionType} />;
}
