import type { CourseTree, SectionType } from "@/features/courses/types/course-tree";

type LessonSeed = {
  title: string;
  videoUrl: string;
  pdfUrl: string;
};

type SectionSeed = {
  type: SectionType;
  title: string;
  level: string;
  topic: string;
  status?: "ACTIVE" | "DRAFT" | "UNDER_DEVELOPMENT";
  lessons: LessonSeed[];
};

type ChapterSeed = {
  title: string;
  description: string;
  sections: SectionSeed[];
};

type CourseSeed = {
  id: number;
  name: string;
  description: string;
  chapters: ChapterSeed[];
};

let chapterIdCounter = 1_000;
let sectionIdCounter = 10_000;
let lessonIdCounter = 100_000;

const makeLessons = (sectionId: number, lessons: LessonSeed[]) =>
  lessons.map((lesson, index) => ({
    id: lessonIdCounter++,
    sectionId,
    title: lesson.title,
    videoUrl: lesson.videoUrl,
    pdfUrl: lesson.pdfUrl,
    lessonOrder: index + 1,
  }));

const makeSections = (chapterId: number, sections: SectionSeed[]) =>
  sections.map((section, index) => {
    const id = sectionIdCounter++;
    return {
      id,
      chapterId,
      type: section.type,
      title: section.title,
      level: section.level,
      topic: section.topic,
      status: section.status ?? "ACTIVE",
      sectionOrder: index + 1,
      lessons: makeLessons(id, section.lessons),
    };
  });

const makeChapters = (courseId: number, chapters: ChapterSeed[]) =>
  chapters.map((chapter, index) => {
    const id = chapterIdCounter++;
    return {
      id,
      courseId,
      title: chapter.title,
      description: chapter.description,
      chapterOrder: index + 1,
      sections: makeSections(id, chapter.sections),
    };
  });

const now = new Date().toISOString();

const sampleSeed: CourseSeed[] = [
  {
    id: 101,
    name: "Tầng 1 • Nền tảng N5",
    description: "Làm quen tiếng Nhật căn bản: từ vựng, ngữ pháp và kanji sơ cấp.",
    chapters: [
      {
        title: "Chào hỏi và tự giới thiệu",
        description: "Nắm nền tảng giao tiếp đầu vào.",
        sections: [
          {
            type: "VOCABULARY",
            title: "Từ vựng chủ đề chào hỏi",
            level: "N5",
            topic: "Greeting",
            lessons: [
              {
                title: "Bài 1: Từ vựng chào hỏi cơ bản",
                videoUrl: "https://www.youtube.com/watch?v=4fN6iM8QJ1g",
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              },
              {
                title: "Bài 2: Mẫu câu giao tiếp ngắn",
                videoUrl: "https://www.youtube.com/watch?v=Z3e7YQf7QjA",
                pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
              },
            ],
          },
          {
            type: "GRAMMAR",
            title: "Mẫu câu desu/masu",
            level: "N5",
            topic: "Basic grammar",
            lessons: [
              {
                title: "Bài 1: Cấu trúc A wa B desu",
                videoUrl: "https://www.youtube.com/watch?v=q6EoRBvdVPQ",
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              },
              {
                title: "Bài 2: Thể lịch sự -masu",
                videoUrl: "https://www.youtube.com/watch?v=RrWBhVlD1H4",
                pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
              },
            ],
          },
          {
            type: "KANJI",
            title: "Kanji nhập môn",
            level: "N5",
            topic: "Starter Kanji",
            lessons: [
              {
                title: "Bài 1: 人・日・本",
                videoUrl: "https://www.youtube.com/watch?v=8W6N6XttvJk",
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              },
              {
                title: "Bài 2: 山・川・口",
                videoUrl: "https://www.youtube.com/watch?v=6U8A9U5V0N8",
                pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
              },
            ],
          },
        ],
      },
      {
        title: "Sinh hoạt hằng ngày",
        description: "Mở rộng mẫu câu và vốn từ đời sống.",
        sections: [
          {
            type: "VOCABULARY",
            title: "Từ vựng sinh hoạt",
            level: "N5",
            topic: "Daily life",
            lessons: [
              {
                title: "Bài 1: Ở nhà và trường học",
                videoUrl: "https://www.youtube.com/watch?v=xn7Q4J6z3Yg",
                pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
              },
              {
                title: "Bài 2: Hoạt động thường ngày",
                videoUrl: "https://www.youtube.com/watch?v=IZ5P0M0N6uU",
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              },
            ],
          },
          {
            type: "GRAMMAR",
            title: "Trợ từ cơ bản",
            level: "N5",
            topic: "Particles",
            lessons: [
              {
                title: "Bài 1: Trợ từ は・が",
                videoUrl: "https://www.youtube.com/watch?v=Q0Y2o99CMp4",
                pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
              },
              {
                title: "Bài 2: Trợ từ を・に・で",
                videoUrl: "https://www.youtube.com/watch?v=Q2g_4QxF9oE",
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              },
            ],
          },
          {
            type: "KANJI",
            title: "Kanji đời sống",
            level: "N5",
            topic: "Daily Kanji",
            lessons: [
              {
                title: "Bài 1: 時・分・上・下",
                videoUrl: "https://www.youtube.com/watch?v=5oNpb0dLnhE",
                pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
              },
              {
                title: "Bài 2: 先・生・学・校",
                videoUrl: "https://www.youtube.com/watch?v=HKL2U5v3uNw",
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 102,
    name: "Tầng 2 • Ứng dụng N4-N3",
    description: "Phát triển kỹ năng hội thoại, đọc hiểu và mở rộng tình huống.",
    chapters: [
      {
        title: "Mua sắm và dịch vụ",
        description: "Học cách giao tiếp trong bối cảnh thực tế.",
        sections: [
          {
            type: "VOCABULARY",
            title: "Từ vựng mua sắm",
            level: "N4",
            topic: "Shopping",
            lessons: [
              {
                title: "Bài 1: Cửa hàng và mặt hàng",
                videoUrl: "https://www.youtube.com/watch?v=ckfQmI9V5jQ",
                pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
              },
              {
                title: "Bài 2: Giá cả và thanh toán",
                videoUrl: "https://www.youtube.com/watch?v=Fs8g2B0y3jA",
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              },
            ],
          },
          {
            type: "GRAMMAR",
            title: "So sánh và điều kiện",
            level: "N4",
            topic: "Comparison/Condition",
            lessons: [
              {
                title: "Bài 1: 〜より・〜ほど",
                videoUrl: "https://www.youtube.com/watch?v=Yu8sT0vkhY8",
                pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
              },
              {
                title: "Bài 2: 〜たら・〜なら",
                videoUrl: "https://www.youtube.com/watch?v=11mE_0a5tqE",
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              },
            ],
          },
          {
            type: "KANJI",
            title: "Kanji trung cấp 1",
            level: "N4",
            topic: "Intermediate Kanji",
            lessons: [
              {
                title: "Bài 1: 経・験・約・束",
                videoUrl: "https://www.youtube.com/watch?v=bP5dX6FQx1Y",
                pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
              },
              {
                title: "Bài 2: 連・絡・予・定",
                videoUrl: "https://www.youtube.com/watch?v=RjvQzv3nCvk",
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              },
            ],
          },
        ],
      },
      {
        title: "Công việc và giao tiếp",
        description: "Ứng dụng tiếng Nhật trong môi trường học tập/làm việc.",
        sections: [
          {
            type: "VOCABULARY",
            title: "Từ vựng công việc",
            level: "N3",
            topic: "Workplace",
            status: "UNDER_DEVELOPMENT",
            lessons: [],
          },
          {
            type: "GRAMMAR",
            title: "Thể bị động và sai khiến",
            level: "N3",
            topic: "Passive/Causative",
            lessons: [
              {
                title: "Bài 1: Câu bị động",
                videoUrl: "https://www.youtube.com/watch?v=I7K2I2kH9v4",
                pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
              },
              {
                title: "Bài 2: Câu sai khiến",
                videoUrl: "https://www.youtube.com/watch?v=2L6tWvW0QWc",
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              },
            ],
          },
          {
            type: "KANJI",
            title: "Kanji trung cấp 2",
            level: "N3",
            topic: "Intermediate Kanji",
            lessons: [
              {
                title: "Bài 1: 働・議・類・報",
                videoUrl: "https://www.youtube.com/watch?v=1A5YJ8h7cZ0",
                pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
              },
              {
                title: "Bài 2: 説・明・提・案",
                videoUrl: "https://www.youtube.com/watch?v=vQdRP6mV1tM",
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 103,
    name: "Tầng 3 • Tăng tốc N2-N1",
    description: "Luyện đọc học thuật và cấu trúc nâng cao chuẩn thi JLPT.",
    chapters: [
      {
        title: "Đọc hiểu nâng cao",
        description: "Tăng tốc khả năng nắm ý và suy luận.",
        sections: [
          {
            type: "VOCABULARY",
            title: "Từ vựng học thuật",
            level: "N2",
            topic: "Academic",
            lessons: [
              {
                title: "Bài 1: Từ vựng xã hội",
                videoUrl: "https://www.youtube.com/watch?v=Y0h2XwN9kqM",
                pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
              },
              {
                title: "Bài 2: Từ vựng kinh tế",
                videoUrl: "https://www.youtube.com/watch?v=2m-c8w56xwM",
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              },
            ],
          },
          {
            type: "GRAMMAR",
            title: "Mẫu ngữ pháp N2",
            level: "N2",
            topic: "Advanced grammar",
            lessons: [
              {
                title: "Bài 1: 〜ざるを得ない",
                videoUrl: "https://www.youtube.com/watch?v=Gfy0J1S-tXI",
                pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
              },
              {
                title: "Bài 2: 〜に違いない",
                videoUrl: "https://www.youtube.com/watch?v=THkIwhb9iV0",
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              },
            ],
          },
          {
            type: "KANJI",
            title: "Kanji nâng cao",
            level: "N2",
            topic: "Advanced Kanji",
            lessons: [
              {
                title: "Bài 1: 論・証・観・測",
                videoUrl: "https://www.youtube.com/watch?v=uQhDUwYQX1M",
                pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
              },
              {
                title: "Bài 2: 率・策・統・環",
                videoUrl: "https://www.youtube.com/watch?v=O2pRHvSLb9M",
                pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              },
            ],
          },
        ],
      },
    ],
  },
];

export const sampleCourseTree: CourseTree[] = sampleSeed.map((course) => ({
  id: course.id,
  thumbnailUrl: null,
  name: course.name,
  description: course.description,
  createdAt: now,
  updatedAt: now,
  chapters: makeChapters(course.id, course.chapters),
}));
