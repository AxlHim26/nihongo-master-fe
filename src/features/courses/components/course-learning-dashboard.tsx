"use client";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";

import { authStorage } from "@/features/auth/utils/auth-storage";
import { sampleCourseTree } from "@/features/courses/data/sample-course-tree";
import { getCourseTree } from "@/features/courses/services/course-tree-service";
import type {
  CourseChapter,
  CourseLesson,
  CourseSection,
  CourseTree,
  SectionType,
} from "@/features/courses/types/course-tree";
import { courseQueryKeys } from "@/features/courses/utils/query-keys";
import { BYPASS_AUTH } from "@/lib/env";
import { ApiError } from "@/lib/fetcher";
import EmptyState from "@/shared/components/ui/empty-state";
import { useLayoutStore } from "@/shared/stores/layout-store";

const SECTION_ORDER: SectionType[] = ["VOCABULARY", "GRAMMAR", "KANJI"];

const SECTION_META: Record<
  SectionType,
  { title: string; description: string; icon: React.ReactNode; colorClass: string }
> = {
  VOCABULARY: {
    title: "Từ vựng",
    description: "Mở rộng vốn từ qua video và tài liệu học tập",
    icon: <TranslateRoundedIcon fontSize="small" />,
    colorClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200",
  },
  GRAMMAR: {
    title: "Ngữ pháp",
    description: "Hiểu cấu trúc câu và cách diễn đạt theo ngữ cảnh",
    icon: <MenuBookRoundedIcon fontSize="small" />,
    colorClass: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200",
  },
  KANJI: {
    title: "Chữ hán",
    description: "Ghi nhớ Kanji theo bài học có hệ thống",
    icon: <SchoolRoundedIcon fontSize="small" />,
    colorClass: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200",
  },
};

const getYoutubeEmbedUrl = (rawUrl: string) => {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace("www.", "");
    if (host === "youtu.be") {
      const id = url.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const watchId = url.searchParams.get("v");
      if (watchId) {
        return `https://www.youtube.com/embed/${watchId}`;
      }
      if (url.pathname.startsWith("/embed/")) {
        const id = url.pathname.replace("/embed/", "");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
    }
  } catch {
    return null;
  }
  return null;
};

const findCourseById = (courses: CourseTree[], courseId: number | null) =>
  courses.find((course) => course.id === courseId) ?? null;

const findChapterById = (course: CourseTree | null, chapterId: number | null) =>
  course?.chapters.find((chapter) => chapter.id === chapterId) ?? null;

const findSectionByType = (chapter: CourseChapter | null, type: SectionType | null) =>
  chapter?.sections.find((section) => section.type === type) ?? null;

const findLessonById = (section: CourseSection | null, lessonId: number | null) =>
  section?.lessons.find((lesson) => lesson.id === lessonId) ?? null;

export default function CourseLearningDashboard() {
  const router = useRouter();
  const setImmersiveMode = useLayoutStore((state) => state.setImmersiveMode);
  const [selectedCourseId, setSelectedCourseId] = React.useState<number | null>(null);
  const [selectedChapterId, setSelectedChapterId] = React.useState<number | null>(null);
  const [selectedSectionType, setSelectedSectionType] = React.useState<SectionType | null>(null);
  const [selectedLessonId, setSelectedLessonId] = React.useState<number | null>(null);

  React.useEffect(() => {
    setImmersiveMode(Boolean(selectedLessonId));
    return () => setImmersiveMode(false);
  }, [selectedLessonId, setImmersiveMode]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: courseQueryKeys.tree(),
    queryFn: getCourseTree,
  });

  const apiCourses = React.useMemo(() => data ?? [], [data]);
  const unauthorized =
    !BYPASS_AUTH && error instanceof ApiError && (error.status === 401 || error.status === 403);
  const usingSampleData = !isLoading && !unauthorized && apiCourses.length === 0;
  const courses = React.useMemo(
    () => (usingSampleData ? sampleCourseTree : apiCourses),
    [apiCourses, usingSampleData],
  );
  const selectedCourse = findCourseById(courses, selectedCourseId);
  const selectedChapter = findChapterById(selectedCourse, selectedChapterId);
  const selectedSection = findSectionByType(selectedChapter, selectedSectionType);
  const selectedLesson = findLessonById(selectedSection, selectedLessonId);

  const sectionsByType = React.useMemo(() => {
    const map: Partial<Record<SectionType, CourseSection>> = {};
    selectedChapter?.sections.forEach((section) => {
      map[section.type] = section;
    });
    return map;
  }, [selectedChapter]);

  React.useEffect(() => {
    if (!courses.length) {
      if (selectedCourseId !== null) {
        setSelectedCourseId(null);
      }
      return;
    }
    const activeCourse = findCourseById(courses, selectedCourseId);
    if (!activeCourse && selectedCourseId !== null) {
      setSelectedCourseId(null);
    }
  }, [courses, selectedCourseId]);

  React.useEffect(() => {
    if (!selectedCourse) {
      if (selectedChapterId !== null) {
        setSelectedChapterId(null);
      }
      return;
    }
    const activeChapter = selectedCourse.chapters.find((item) => item.id === selectedChapterId);
    if (!activeChapter && selectedChapterId !== null) {
      setSelectedChapterId(null);
    }
  }, [selectedCourse, selectedChapterId]);

  React.useEffect(() => {
    if (!selectedChapter) {
      if (selectedSectionType !== null) {
        setSelectedSectionType(null);
      }
      return;
    }
    const currentSection = selectedChapter.sections.find(
      (item) => item.type === selectedSectionType,
    );
    if (!currentSection && selectedSectionType !== null) {
      setSelectedSectionType(null);
    }
  }, [selectedChapter, selectedSectionType]);

  React.useEffect(() => {
    if (!selectedSection) {
      if (selectedLessonId !== null) {
        setSelectedLessonId(null);
      }
      return;
    }
    const currentLesson = selectedSection.lessons.find((item) => item.id === selectedLessonId);
    if (!currentLesson && selectedLessonId !== null) {
      setSelectedLessonId(null);
    }
  }, [selectedSection, selectedLessonId]);

  const handleLogout = () => {
    authStorage.clearSession();
    router.replace("/login");
  };

  const handleSelectCourse = (course: CourseTree) => {
    setSelectedCourseId(course.id);
    setSelectedChapterId(null);
    setSelectedSectionType(null);
    setSelectedLessonId(null);
  };

  const handleBackToCourseList = () => {
    setSelectedCourseId(null);
    setSelectedChapterId(null);
    setSelectedSectionType(null);
    setSelectedLessonId(null);
  };

  const handleSelectChapter = (chapterId: number) => {
    setSelectedChapterId(chapterId);
    setSelectedSectionType(null);
    setSelectedLessonId(null);
  };

  const handleBackToChapterList = () => {
    setSelectedChapterId(null);
    setSelectedSectionType(null);
    setSelectedLessonId(null);
  };

  const handleBackToSectionList = () => {
    setSelectedSectionType(null);
    setSelectedLessonId(null);
  };

  const handleBackToLessons = () => {
    setSelectedLessonId(null);
  };

  const showCourseList = !selectedCourse;
  const showChapterList = Boolean(selectedCourse) && !selectedChapter;
  const showSectionList = Boolean(selectedChapter) && !selectedSection;
  const showLessonList = Boolean(selectedSection) && !selectedLesson;
  const showLessonViewer = Boolean(selectedSection) && Boolean(selectedLesson);

  return (
    <Stack spacing={4}>
      {!BYPASS_AUTH && (
        <Stack direction="row" justifyContent="flex-end">
          <Button color="inherit" startIcon={<LogoutRoundedIcon />} onClick={handleLogout}>
            Đăng xuất
          </Button>
        </Stack>
      )}

      {isLoading && (
        <Paper elevation={0} className="rounded-2xl border border-[var(--app-border)] p-4">
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Đang tải khóa học...
            </Typography>
            <LinearProgress />
          </Stack>
        </Paper>
      )}

      {isError && (
        <Alert
          severity={unauthorized ? "warning" : "error"}
          action={
            unauthorized ? (
              <Button color="inherit" size="small" onClick={handleLogout}>
                Đăng nhập lại
              </Button>
            ) : undefined
          }
        >
          {unauthorized
            ? "Bạn không có quyền truy cập hoặc phiên đăng nhập đã hết hạn."
            : "Không thể tải dữ liệu khóa học từ máy chủ. Đang hiển thị dữ liệu mẫu theo các tầng."}
        </Alert>
      )}

      {!isLoading && !unauthorized && courses.length === 0 && (
        <EmptyState
          icon={<AutoStoriesRoundedIcon />}
          title="Chưa có khóa học"
          description="Hệ thống chưa có dữ liệu khóa học để hiển thị."
        />
      )}

      {!isLoading && !unauthorized && courses.length > 0 && (
        <Stack spacing={4}>
          {showCourseList && (
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                spacing={1.5}
              >
                <Typography variant="h6" fontWeight={600}>
                  Danh sách khóa học
                </Typography>
                {usingSampleData && (
                  <Chip
                    size="small"
                    color="warning"
                    variant="outlined"
                    label="Đang hiển thị khóa học mẫu theo 3 tầng"
                  />
                )}
              </Stack>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <Paper
                    key={course.id}
                    elevation={0}
                    onClick={() => handleSelectCourse(course)}
                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 transition hover:-translate-y-[2px] hover:border-blue-200 hover:shadow-lg"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_42%),linear-gradient(160deg,rgba(15,23,42,0.03),transparent_55%)]" />
                    <div className="relative flex h-full flex-col justify-between">
                      <Stack spacing={1.5}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {course.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {course.description ?? "Khóa học chưa có mô tả."}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip size="small" label={`${course.chapters.length} chương`} />
                        <Chip
                          size="small"
                          label={`${course.chapters.reduce(
                            (sum, chapter) =>
                              sum +
                              chapter.sections.reduce(
                                (acc, section) => acc + section.lessons.length,
                                0,
                              ),
                            0,
                          )} bài học`}
                        />
                      </Stack>
                    </div>
                  </Paper>
                ))}
              </div>
            </Stack>
          )}

          {showChapterList && selectedCourse && (
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Button
                  size="large"
                  startIcon={<ArrowBackRoundedIcon fontSize="medium" />}
                  onClick={handleBackToCourseList}
                  className="text-base font-semibold normal-case"
                >
                  Quay lại khóa học
                </Button>
                <Divider flexItem orientation="vertical" />
                <Typography variant="subtitle1" fontWeight={700}>
                  {selectedCourse.name}
                </Typography>
              </Stack>

              <Typography variant="h6" fontWeight={600}>
                Danh sách chương
              </Typography>
              {selectedCourse.chapters.length === 0 ? (
                <EmptyState
                  icon={<AutoStoriesRoundedIcon />}
                  title="Khóa học chưa có chương"
                  description="Nội dung chương đang được cập nhật."
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {selectedCourse.chapters.map((chapter) => (
                    <Paper
                      key={chapter.id}
                      elevation={0}
                      onClick={() => handleSelectChapter(chapter.id)}
                      className="cursor-pointer rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 transition hover:border-blue-200"
                    >
                      <Stack spacing={1}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Chương {chapter.chapterOrder}: {chapter.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {chapter.description ?? "Không có mô tả cho chương này."}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </div>
              )}
            </Stack>
          )}

          {showSectionList && selectedCourse && selectedChapter && (
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Button
                  size="large"
                  startIcon={<ArrowBackRoundedIcon fontSize="medium" />}
                  onClick={handleBackToChapterList}
                  className="text-base font-semibold normal-case"
                >
                  Quay lại chương
                </Button>
                <Divider flexItem orientation="vertical" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Chương {selectedChapter.chapterOrder}: {selectedChapter.title}
                </Typography>
              </Stack>

              <Typography variant="h6" fontWeight={600}>
                Chọn mục học
              </Typography>
              <div className="grid gap-3 md:grid-cols-3">
                {SECTION_ORDER.map((sectionType) => {
                  const section = sectionsByType[sectionType];
                  const meta = SECTION_META[sectionType];
                  return (
                    <Paper
                      key={sectionType}
                      elevation={0}
                      onClick={() => {
                        if (section) {
                          setSelectedSectionType(sectionType);
                          setSelectedLessonId(null);
                        }
                      }}
                      className={`rounded-2xl border p-4 transition ${
                        section
                          ? "cursor-pointer border-[var(--app-border)] bg-[var(--app-card)] hover:border-blue-200"
                          : "cursor-not-allowed border-dashed border-[var(--app-border)] bg-[var(--app-card)] opacity-70"
                      }`}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <span
                            className={`rounded-lg px-2 py-1 text-xs font-semibold ${meta.colorClass}`}
                          >
                            {meta.icon}
                          </span>
                          <Chip
                            size="small"
                            label={
                              !section
                                ? "Trống"
                                : section.status === "UNDER_DEVELOPMENT"
                                  ? "Đang phát triển"
                                  : `${section.lessons.length} bài`
                            }
                            color={
                              section && section.status !== "UNDER_DEVELOPMENT"
                                ? "primary"
                                : "default"
                            }
                            variant={section ? "filled" : "outlined"}
                          />
                        </Stack>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {meta.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {section?.title ?? meta.description}
                        </Typography>
                      </Stack>
                    </Paper>
                  );
                })}
              </div>
            </Stack>
          )}

          {(showLessonList || showLessonViewer) && selectedSection && (
            <Stack spacing={2}>
              {showLessonList && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Button
                    size="large"
                    startIcon={<ArrowBackRoundedIcon fontSize="medium" />}
                    onClick={handleBackToSectionList}
                    className="text-base font-semibold normal-case"
                  >
                    Quay lại mục
                  </Button>
                  <Divider flexItem orientation="vertical" />
                  <Typography variant="subtitle1" fontWeight={700}>
                    {SECTION_META[selectedSection.type].title} • {selectedSection.title}
                  </Typography>
                </Stack>
              )}

              {selectedSection.status === "UNDER_DEVELOPMENT" && (
                <Alert severity="info">
                  Mục này đang trong quá trình phát triển. Một số bài học hoặc tài liệu có thể chưa
                  đầy đủ.
                </Alert>
              )}

              {showLessonList && (
                <>
                  <Typography variant="h6" fontWeight={600}>
                    Danh sách bài học
                  </Typography>
                  {selectedSection.lessons.length === 0 ? (
                    <EmptyState
                      icon={<PlayCircleRoundedIcon />}
                      title="Chưa có bài học"
                      description="Nội dung bài học đang được cập nhật."
                    />
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {selectedSection.lessons.map((lesson) => (
                        <Paper
                          key={lesson.id}
                          elevation={0}
                          onClick={() => setSelectedLessonId(lesson.id)}
                          className="cursor-pointer rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 transition hover:border-blue-200"
                        >
                          <Stack spacing={1}>
                            <div className="flex items-center justify-between gap-2">
                              <Typography variant="subtitle1" fontWeight={700}>
                                {lesson.title}
                              </Typography>
                              <PlayCircleRoundedIcon fontSize="small" />
                            </div>
                            <Typography variant="caption" color="text.secondary">
                              Bài {lesson.lessonOrder}
                            </Typography>
                          </Stack>
                        </Paper>
                      ))}
                    </div>
                  )}
                </>
              )}

              {showLessonViewer && selectedLesson && (
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <Stack spacing={3}>
                    <Button
                      size="large"
                      startIcon={<ArrowBackRoundedIcon fontSize="medium" />}
                      onClick={handleBackToLessons}
                      className="self-start"
                    >
                      Quay lại danh sách bài học
                    </Button>
                    <LessonVideo lesson={selectedLesson} />
                    <LessonPdf lesson={selectedLesson} />
                  </Stack>

                  <Paper
                    elevation={0}
                    className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-3"
                  >
                    <Typography variant="subtitle2" fontWeight={700} className="px-2 pb-2 pt-1">
                      Danh sách bài học
                    </Typography>
                    <div className="flex gap-2 overflow-x-auto pb-2 lg:max-h-[740px] lg:flex-col lg:overflow-y-auto">
                      {selectedSection.lessons.map((lesson) => {
                        const active = lesson.id === selectedLesson.id;
                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => setSelectedLessonId(lesson.id)}
                            className={`min-w-[200px] rounded-xl border px-3 py-2 text-left transition lg:min-w-0 ${
                              active
                                ? "border-blue-300 bg-blue-50 dark:bg-blue-500/10"
                                : "border-[var(--app-border)] hover:border-blue-200"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <Typography variant="body2" fontWeight={600}>
                                {lesson.title}
                              </Typography>
                              <PlayCircleRoundedIcon fontSize="small" />
                            </div>
                            <Typography variant="caption" color="text.secondary">
                              Bài {lesson.lessonOrder}
                            </Typography>
                          </button>
                        );
                      })}
                    </div>
                  </Paper>
                </div>
              )}
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );
}

type LessonVideoProps = {
  lesson: CourseLesson;
};

function LessonVideo({ lesson }: LessonVideoProps) {
  const embedUrl = lesson.videoUrl ? getYoutubeEmbedUrl(lesson.videoUrl) : null;

  return (
    <Paper
      elevation={0}
      className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-4"
    >
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight={700}>
          {lesson.title}
        </Typography>
        <div className="overflow-hidden rounded-2xl border border-[var(--app-border)]">
          {embedUrl ? (
            <iframe
              title={`video-${lesson.id}`}
              src={embedUrl}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : lesson.videoUrl ? (
            <video controls src={lesson.videoUrl} className="aspect-video w-full bg-black" />
          ) : (
            <div className="flex aspect-video items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-900">
              Video chưa được cập nhật
            </div>
          )}
        </div>
        {lesson.videoUrl && (
          <Button
            size="small"
            variant="text"
            href={lesson.videoUrl}
            target="_blank"
            rel="noreferrer"
          >
            Mở video ở tab mới
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

type LessonPdfProps = {
  lesson: CourseLesson;
};

function LessonPdf({ lesson }: LessonPdfProps) {
  return (
    <Paper
      elevation={0}
      className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-4"
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PictureAsPdfRoundedIcon fontSize="small" />
          <Typography variant="subtitle1" fontWeight={700}>
            Tài liệu PDF
          </Typography>
        </Stack>
        <div className="overflow-hidden rounded-2xl border border-[var(--app-border)]">
          {lesson.pdfUrl ? (
            <iframe title={`pdf-${lesson.id}`} src={lesson.pdfUrl} className="h-[460px] w-full" />
          ) : (
            <div className="flex h-[220px] items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-900">
              Chưa có tài liệu PDF cho bài học này
            </div>
          )}
        </div>
        {lesson.pdfUrl && (
          <Button size="small" variant="text" href={lesson.pdfUrl} target="_blank" rel="noreferrer">
            Mở PDF ở tab mới
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
