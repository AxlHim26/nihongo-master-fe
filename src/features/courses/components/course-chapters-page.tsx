"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import * as React from "react";

import { authStorage } from "@/features/auth/utils/auth-storage";
import {
  ChapterCard,
  CourseStateBlock,
  HeaderWithBack,
} from "@/features/courses/components/course-tree-ui";
import { useCourseTreeData } from "@/features/courses/hooks/use-course-tree-data";
import {
  findCourseById,
  getChapterPath,
  parsePositiveInt,
} from "@/features/courses/utils/course-tree-selectors";

type CourseChaptersPageProps = {
  courseId: string;
};

export default function CourseChaptersPage({ courseId }: CourseChaptersPageProps) {
  const router = useRouter();
  const parsedCourseId = React.useMemo(() => parsePositiveInt(courseId), [courseId]);
  const { courses, isLoading, isError, unauthorized, usingSampleData } = useCourseTreeData();

  const course = React.useMemo(
    () => findCourseById(courses, parsedCourseId),
    [courses, parsedCourseId],
  );

  const handleReauth = React.useCallback(() => {
    authStorage.clearSession();
    router.replace("/login");
  }, [router]);

  const handleSelectChapter = React.useCallback(
    (chapterId: number) => {
      if (!parsedCourseId) {
        return;
      }
      router.push(getChapterPath(parsedCourseId, chapterId));
    },
    [parsedCourseId, router],
  );

  const handleBack = React.useCallback(() => {
    router.push("/courses");
  }, [router]);

  return (
    <Stack spacing={3}>
      <HeaderWithBack
        onBack={handleBack}
        backText="Quay lại khóa học"
        title={course ? course.name : "Khóa học"}
      />

      <Typography variant="h6" fontWeight={600}>
        Danh sách chương
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
        {!parsedCourseId || !course ? (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={() => router.push("/courses")}>
                Về danh sách
              </Button>
            }
          >
            Không tìm thấy khóa học theo đường dẫn hiện tại.
          </Alert>
        ) : course.chapters.length === 0 ? (
          <Alert severity="info">Khóa học chưa có chương.</Alert>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {course.chapters.map((chapter) => (
              <ChapterCard key={chapter.id} chapter={chapter} onSelect={handleSelectChapter} />
            ))}
          </div>
        )}
      </CourseStateBlock>
    </Stack>
  );
}
