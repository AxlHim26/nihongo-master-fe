import type { Metadata } from "next";

import CourseLessonViewerPage from "@/features/courses/components/course-lesson-viewer-page";

type CourseLessonPageProps = {
  params: Promise<{
    courseId: string;
    chapterId: string;
    sectionType: string;
    lessonId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Xem bài học",
  description: "Xem video và tài liệu của bài học",
};

export default async function CourseLessonPage({ params }: CourseLessonPageProps) {
  const { courseId, chapterId, sectionType, lessonId } = await params;
  return (
    <CourseLessonViewerPage
      courseId={courseId}
      chapterId={chapterId}
      sectionType={sectionType}
      lessonId={lessonId}
    />
  );
}
