"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import * as React from "react";

import { authStorage } from "@/features/auth/utils/auth-storage";
import {
  CourseStateBlock,
  HeaderWithBack,
  LessonListItem,
  LessonPdf,
  LessonVideo,
  SECTION_META,
} from "@/features/courses/components/course-tree-ui";
import { useCourseTreeData } from "@/features/courses/hooks/use-course-tree-data";
import {
  findChapterById,
  findCourseById,
  findLessonById,
  findSectionByType,
  getLessonPath,
  parsePositiveInt,
  parseSectionType,
} from "@/features/courses/utils/course-tree-selectors";
import { useLayoutStore } from "@/shared/stores/layout-store";

type CourseLessonViewerPageProps = {
  courseId: string;
  chapterId: string;
  sectionType: string;
  lessonId: string;
};

export default function CourseLessonViewerPage({
  courseId,
  chapterId,
  sectionType,
  lessonId,
}: CourseLessonViewerPageProps) {
  const router = useRouter();
  const setImmersiveMode = useLayoutStore((state) => state.setImmersiveMode);

  React.useEffect(() => {
    setImmersiveMode(true);
    return () => setImmersiveMode(false);
  }, [setImmersiveMode]);

  const parsedCourseId = React.useMemo(() => parsePositiveInt(courseId), [courseId]);
  const parsedChapterId = React.useMemo(() => parsePositiveInt(chapterId), [chapterId]);
  const parsedSectionType = React.useMemo(() => parseSectionType(sectionType), [sectionType]);
  const parsedLessonId = React.useMemo(() => parsePositiveInt(lessonId), [lessonId]);

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
  const lesson = React.useMemo(
    () => findLessonById(section, parsedLessonId),
    [section, parsedLessonId],
  );

  const handleReauth = React.useCallback(() => {
    authStorage.clearSession();
    router.replace("/login");
  }, [router]);

  const handleBack = React.useCallback(() => {
    if (!parsedCourseId || !parsedChapterId || !parsedSectionType) {
      router.push("/courses");
      return;
    }

    router.push(
      `/courses/${parsedCourseId}/chapters/${parsedChapterId}/sections/${parsedSectionType.toLowerCase()}`,
    );
  }, [parsedChapterId, parsedCourseId, parsedSectionType, router]);

  const handleSelectLesson = React.useCallback(
    (nextLessonId: number) => {
      if (!parsedCourseId || !parsedChapterId || !parsedSectionType) {
        return;
      }

      router.push(getLessonPath(parsedCourseId, parsedChapterId, parsedSectionType, nextLessonId));
    },
    [parsedChapterId, parsedCourseId, parsedSectionType, router],
  );

  const sectionTitle = parsedSectionType ? SECTION_META[parsedSectionType].title : "Bài học";

  return (
    <Stack spacing={3}>
      <HeaderWithBack
        onBack={handleBack}
        backText="Quay lại danh sách bài học"
        title={sectionTitle}
      />

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
        !parsedLessonId ||
        !course ||
        !chapter ||
        !section ||
        !lesson ? (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={handleBack}>
                Quay lại
              </Button>
            }
          >
            Không tìm thấy bài học theo đường dẫn hiện tại.
          </Alert>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Stack spacing={3}>
              <LessonVideo lesson={lesson} />
              <LessonPdf lesson={lesson} />
            </Stack>

            <Paper
              elevation={0}
              className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-3"
            >
              <Typography variant="subtitle2" fontWeight={700} className="px-2 pb-2 pt-1">
                Danh sách bài học
              </Typography>
              <div className="flex gap-2 overflow-x-auto pb-2 lg:max-h-[740px] lg:flex-col lg:overflow-y-auto">
                {section.lessons.map((item) => (
                  <LessonListItem
                    key={item.id}
                    lesson={item}
                    active={item.id === lesson.id}
                    onSelect={handleSelectLesson}
                  />
                ))}
              </div>
            </Paper>
          </div>
        )}
      </CourseStateBlock>
    </Stack>
  );
}
