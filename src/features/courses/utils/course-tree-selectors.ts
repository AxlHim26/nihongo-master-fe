import type {
  CourseChapter,
  CourseSection,
  CourseTree,
  SectionType,
} from "@/features/courses/types/course-tree";

const SECTION_TYPES: SectionType[] = ["VOCABULARY", "GRAMMAR", "KANJI", "READING", "LISTENING"];

export const findCourseById = (courses: CourseTree[], courseId: number | null) =>
  courses.find((course) => course.id === courseId) ?? null;

export const findChapterById = (course: CourseTree | null, chapterId: number | null) =>
  course?.chapters.find((chapter) => chapter.id === chapterId) ?? null;

export const findSectionByType = (chapter: CourseChapter | null, type: SectionType | null) =>
  chapter?.sections.find((section) => section.type === type) ?? null;

export const findLessonById = (section: CourseSection | null, lessonId: number | null) =>
  section?.lessons.find((lesson) => lesson.id === lessonId) ?? null;

export const parsePositiveInt = (value: string): number | null => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

export const parseSectionType = (value: string): SectionType | null => {
  const normalized = value.toUpperCase();
  return SECTION_TYPES.find((type) => type === normalized) ?? null;
};

export const getLessonCountByCourse = (courses: CourseTree[]) => {
  const map = new Map<number, number>();

  courses.forEach((course) => {
    const total = course.chapters.reduce(
      (sum, chapter) =>
        sum +
        chapter.sections.reduce((sectionSum, section) => sectionSum + section.lessons.length, 0),
      0,
    );
    map.set(course.id, total);
  });

  return map;
};

export const getSectionsByType = (chapter: CourseChapter | null) => {
  const map: Partial<Record<SectionType, CourseSection>> = {};
  chapter?.sections.forEach((section) => {
    map[section.type] = section;
  });
  return map;
};

export const getCoursePath = (courseId: number) => `/courses/${courseId}`;

export const getChapterPath = (courseId: number, chapterId: number) =>
  `/courses/${courseId}/chapters/${chapterId}`;

export const getSectionPath = (courseId: number, chapterId: number, sectionType: SectionType) =>
  `/courses/${courseId}/chapters/${chapterId}/sections/${sectionType.toLowerCase()}`;

export const getLessonPath = (
  courseId: number,
  chapterId: number,
  sectionType: SectionType,
  lessonId: number,
) =>
  `/courses/${courseId}/chapters/${chapterId}/sections/${sectionType.toLowerCase()}/lessons/${lessonId}`;
