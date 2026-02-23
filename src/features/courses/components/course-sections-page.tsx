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
  SECTION_ORDER,
  SectionCard,
} from "@/features/courses/components/course-tree-ui";
import { useCourseTreeData } from "@/features/courses/hooks/use-course-tree-data";
import {
  findChapterById,
  findCourseById,
  getSectionPath,
  getSectionsByType,
  parsePositiveInt,
} from "@/features/courses/utils/course-tree-selectors";

type CourseSectionsPageProps = {
  courseId: string;
  chapterId: string;
};

export default function CourseSectionsPage({ courseId, chapterId }: CourseSectionsPageProps) {
  const router = useRouter();
  const parsedCourseId = React.useMemo(() => parsePositiveInt(courseId), [courseId]);
  const parsedChapterId = React.useMemo(() => parsePositiveInt(chapterId), [chapterId]);
  const { courses, isLoading, isError, unauthorized, usingSampleData } = useCourseTreeData();

  const course = React.useMemo(
    () => findCourseById(courses, parsedCourseId),
    [courses, parsedCourseId],
  );
  const chapter = React.useMemo(
    () => findChapterById(course, parsedChapterId),
    [course, parsedChapterId],
  );

  const sectionsByType = React.useMemo(() => getSectionsByType(chapter), [chapter]);

  const handleReauth = React.useCallback(() => {
    authStorage.clearSession();
    router.replace("/login");
  }, [router]);

  const handleBack = React.useCallback(() => {
    if (!parsedCourseId) {
      router.push("/courses");
      return;
    }
    router.push(`/courses/${parsedCourseId}`);
  }, [parsedCourseId, router]);

  const handleSelectSection = React.useCallback(
    (sectionType: (typeof SECTION_ORDER)[number]) => {
      if (!parsedCourseId || !parsedChapterId) {
        return;
      }

      router.push(getSectionPath(parsedCourseId, parsedChapterId, sectionType));
    },
    [parsedChapterId, parsedCourseId, router],
  );

  return (
    <Stack spacing={3}>
      <HeaderWithBack
        onBack={handleBack}
        backText="Quay lại chương"
        title={chapter?.title ?? "Chương"}
      />

      <Typography variant="h6" fontWeight={600}>
        Chọn mục học
      </Typography>

      <CourseStateBlock
        isLoading={isLoading}
        isError={isError}
        unauthorized={unauthorized}
        usingSampleData={usingSampleData}
        hasData={courses.length > 0}
        onReauth={handleReauth}
        emptyTitle="Chưa có khóa học"
        emptyDescription="Hệ thống chưa có dữ liệu khóa học để hiển thị."
      >
        {!parsedCourseId || !parsedChapterId || !course || !chapter ? (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={handleBack}>
                Quay lại
              </Button>
            }
          >
            Không tìm thấy chương theo đường dẫn hiện tại.
          </Alert>
        ) : (
          <>
            {chapter.sections.length === 0 && (
              <Alert severity="info">Chương này chưa có mục học.</Alert>
            )}
            <div className="grid gap-3 md:grid-cols-3">
              {SECTION_ORDER.map((sectionType) => (
                <SectionCard
                  key={sectionType}
                  sectionType={sectionType}
                  section={sectionsByType[sectionType] ?? null}
                  onSelect={handleSelectSection}
                />
              ))}
            </div>
          </>
        )}
      </CourseStateBlock>
    </Stack>
  );
}
