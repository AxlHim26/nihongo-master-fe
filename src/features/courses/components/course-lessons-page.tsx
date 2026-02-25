"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import * as React from "react";

import { authStorage } from "@/features/auth/utils/auth-storage";
import {
  CourseStateBlock,
  HeaderWithBack,
  LessonCard,
  SECTION_META,
} from "@/features/courses/components/course-tree-ui";
import { useCourseTreeData } from "@/features/courses/hooks/use-course-tree-data";
import {
  findChapterById,
  findCourseById,
  findSectionByType,
  getLessonPath,
  parsePositiveInt,
  parseSectionType,
} from "@/features/courses/utils/course-tree-selectors";

export type CourseLessonsPageProps = {
  courseId: string;
  chapterId: string;
  sectionType: string;
};

export default function CourseLessonsPage({
  courseId,
  chapterId,
  sectionType,
}: CourseLessonsPageProps) {
  const router = useRouter();
  const parsedCourseId = React.useMemo(() => parsePositiveInt(courseId), [courseId]);
  const parsedChapterId = React.useMemo(() => parsePositiveInt(chapterId), [chapterId]);
  const parsedSectionType = React.useMemo(() => parseSectionType(sectionType), [sectionType]);
  const { courses, isLoading, isError, unauthorized } = useCourseTreeData();

  const course = React.useMemo(
    () => findCourseById(courses, parsedCourseId),
    [courses, parsedCourseId],
  );
  const chapter = React.useMemo(
    () => findChapterById(course, parsedChapterId),
    [course, parsedChapterId],
  );
  const section = React.useMemo(
    () => findSectionByType(chapter, parsedSectionType),
    [chapter, parsedSectionType],
  );

  const handleReauth = React.useCallback(() => {
    authStorage.clearSession();
    router.replace("/login");
  }, [router]);

  const handleBack = React.useCallback(() => {
    if (!parsedCourseId || !parsedChapterId) {
      router.push("/courses");
      return;
    }

    router.push(`/courses/${parsedCourseId}/chapters/${parsedChapterId}`);
  }, [parsedChapterId, parsedCourseId, router]);

  const handleSelectLesson = React.useCallback(
    (lessonId: number) => {
      if (!parsedCourseId || !parsedChapterId || !parsedSectionType) {
        return;
      }

      router.push(getLessonPath(parsedCourseId, parsedChapterId, parsedSectionType, lessonId));
    },
    [parsedChapterId, parsedCourseId, parsedSectionType, router],
  );

  const sectionTitle = parsedSectionType ? SECTION_META[parsedSectionType].title : "Mục học";

  return (
    <Stack spacing={3}>
      <HeaderWithBack onBack={handleBack} backText="Quay lại mục" title={sectionTitle} />

      <Typography variant="h6" fontWeight={600}>
        Danh sách bài học
      </Typography>

      <CourseStateBlock
        isLoading={isLoading}
        isError={isError}
        unauthorized={unauthorized}
        hasData={courses.length > 0}
        onReauth={handleReauth}
        emptyTitle="Chưa có khóa học"
        emptyDescription="Hệ thống chưa có dữ liệu khóa học để hiển thị."
      >
        {!parsedCourseId ||
        !parsedChapterId ||
        !parsedSectionType ||
        !course ||
        !chapter ||
        !section ? (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={handleBack}>
                Quay lại
              </Button>
            }
          >
            Không tìm thấy mục học theo đường dẫn hiện tại.
          </Alert>
        ) : (
          <>
            {section.status === "UNDER_DEVELOPMENT" && (
              <Alert severity="info">
                Mục này đang trong quá trình phát triển. Một số bài học hoặc tài liệu có thể chưa
                đầy đủ.
              </Alert>
            )}

            {section.lessons.length === 0 ? (
              <Alert severity="info">Mục này chưa có bài học.</Alert>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {section.lessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} onSelect={handleSelectLesson} />
                ))}
              </div>
            )}
          </>
        )}
      </CourseStateBlock>
    </Stack>
  );
}
