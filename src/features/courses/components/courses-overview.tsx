import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CourseList from "@/features/courses/components/course-list";
import CourseStats from "@/features/courses/components/course-stats";

export default function CoursesOverview() {
  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700}>
          Khóa học
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lộ trình học tập có cấu trúc dành cho từng mục tiêu JLPT
        </Typography>
      </Stack>
      <CourseStats />
      <CourseList />
    </Stack>
  );
}
