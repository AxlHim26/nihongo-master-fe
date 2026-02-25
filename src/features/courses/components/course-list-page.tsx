"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import * as React from "react";

import { authStorage } from "@/features/auth/utils/auth-storage";
import { CourseCard, CourseStateBlock } from "@/features/courses/components/course-tree-ui";
import { useCourseTreeData } from "@/features/courses/hooks/use-course-tree-data";
import {
  getCoursePath,
  getLessonCountByCourse,
} from "@/features/courses/utils/course-tree-selectors";

export default function CourseListPage() {
  const router = useRouter();
  const { courses, isLoading, isError, unauthorized } = useCourseTreeData();

  const lessonCountByCourse = React.useMemo(() => getLessonCountByCourse(courses), [courses]);

  const handleReauth = React.useCallback(() => {
    authStorage.clearSession();
    router.replace("/login");
  }, [router]);

  const handleSelectCourse = React.useCallback(
    (courseId: number) => {
      router.push(getCoursePath(courseId));
    },
    [router],
  );

  return (
    <Stack spacing={3}>
      <Typography variant="h6" fontWeight={600}>
        Danh sách khóa học
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              lessonCount={lessonCountByCourse.get(course.id) ?? 0}
              onSelect={handleSelectCourse}
            />
          ))}
        </div>
      </CourseStateBlock>
    </Stack>
  );
}
