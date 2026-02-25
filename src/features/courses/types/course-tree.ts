export type SectionType = "VOCABULARY" | "GRAMMAR" | "KANJI" | "READING" | "LISTENING";

export type CourseLesson = {
  id: number;
  sectionId: number;
  title: string;
  videoUrl: string | null;
  pdfUrl: string | null;
  lessonOrder: number;
};

export type CourseSection = {
  id: number;
  chapterId: number;
  type: SectionType;
  title: string;
  level: string | null;
  topic: string | null;
  status: "ACTIVE" | "DRAFT" | "UNDER_DEVELOPMENT";
  sectionOrder: number;
  lessons: CourseLesson[];
};

export type CourseChapter = {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  chapterOrder: number;
  sections: CourseSection[];
};

export type CourseTree = {
  id: number;
  thumbnailUrl: string | null;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  chapters: CourseChapter[];
};
