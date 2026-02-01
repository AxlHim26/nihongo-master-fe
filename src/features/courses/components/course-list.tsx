import MenuBookIcon from "@mui/icons-material/MenuBook";
import TimerIcon from "@mui/icons-material/Timer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { courses } from "@/core/data/courses";
import SectionCard from "@/shared/components/ui/section-card";

export default function CourseList() {
  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={600}>
        Khóa học nổi bật
      </Typography>
      {courses.map((course) => (
        <SectionCard
          key={course.id}
          title={course.title}
          description={course.description}
          meta={
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MenuBookIcon fontSize="inherit" /> {course.lessonCount} bài học
              </span>
              <span className="flex items-center gap-1">
                <TimerIcon fontSize="inherit" /> {course.duration}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {course.level}
              </span>
              {course.badge && (
                <span className="rounded-full border border-indigo-200 px-2 py-0.5 text-[11px] text-indigo-500">
                  {course.badge}
                </span>
              )}
            </div>
          }
        />
      ))}
    </Stack>
  );
}
