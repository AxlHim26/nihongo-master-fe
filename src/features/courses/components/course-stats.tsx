import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";
import TimerIcon from "@mui/icons-material/Timer";

import { courses } from "@/core/data/courses";
import StatCard from "@/shared/components/ui/stat-card";

const totalLessons = courses.reduce((sum, course) => sum + course.lessonCount, 0);
const totalWeeks = courses.reduce((sum, course) => sum + Number.parseInt(course.duration, 10), 0);

export default function CourseStats() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <StatCard
        icon={<SchoolIcon fontSize="small" />}
        label="Lộ trình"
        value={courses.length}
        tone="neutral"
      />
      <StatCard icon={<MenuBookIcon fontSize="small" />} label="Bài học" value={totalLessons} />
      <StatCard
        icon={<TimerIcon fontSize="small" />}
        label="Thời lượng"
        value={`${totalWeeks} tuần`}
      />
    </div>
  );
}
