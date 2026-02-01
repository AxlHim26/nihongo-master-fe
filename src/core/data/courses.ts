import type { Course } from "@/features/courses/types/course";

export const courses: Course[] = [
  {
    id: "minna-n5",
    title: "Minna no Nihongo I",
    description: "Nền tảng ngữ pháp, từ vựng và hội thoại cho N5",
    lessonCount: 25,
    duration: "6 tuần",
    level: "N5",
    badge: "Mới",
  },
  {
    id: "minna-n4",
    title: "Minna no Nihongo II",
    description: "Củng cố cấu trúc câu và phản xạ giao tiếp N4",
    lessonCount: 25,
    duration: "7 tuần",
    level: "N4",
  },
  {
    id: "mimikara-n3",
    title: "Mimikara Oboeru N3",
    description: "Tập trung mẫu câu và đọc hiểu nâng cao N3",
    lessonCount: 10,
    duration: "5 tuần",
    level: "N3",
  },
  {
    id: "kanzen-n2",
    title: "Shin Kanzen N2",
    description: "Chiến lược luyện thi và mở rộng kiến thức học thuật",
    lessonCount: 12,
    duration: "8 tuần",
    level: "N2",
  },
];
