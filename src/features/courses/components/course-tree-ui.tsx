"use client";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as React from "react";

import type {
  CourseChapter,
  CourseLesson,
  CourseSection,
  CourseTree,
  SectionType,
} from "@/features/courses/types/course-tree";
import { getBackendApiUrl } from "@/lib/env";
import EmptyState from "@/shared/components/ui/empty-state";

export const SECTION_ORDER: SectionType[] = ["VOCABULARY", "GRAMMAR", "KANJI"];

export const SECTION_META: Record<
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

type CourseStateProps = {
  isLoading: boolean;
  isError: boolean;
  unauthorized: boolean;
  usingSampleData: boolean;
  hasData: boolean;
  onReauth: () => void;
  emptyTitle: string;
  emptyDescription: string;
  children: React.ReactNode;
};

export function CourseStateBlock({
  isLoading,
  isError,
  unauthorized,
  usingSampleData,
  hasData,
  onReauth,
  emptyTitle,
  emptyDescription,
  children,
}: CourseStateProps) {
  if (isLoading) {
    return (
      <Paper elevation={0} className="rounded-2xl border border-[var(--app-border)] p-4">
        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={600}>
            Đang tải khóa học...
          </Typography>
          <LinearProgress />
        </Stack>
      </Paper>
    );
  }

  if (isError) {
    return (
      <Alert
        severity={unauthorized ? "warning" : "error"}
        action={
          unauthorized ? (
            <Button color="inherit" size="small" onClick={onReauth}>
              Đăng nhập lại
            </Button>
          ) : undefined
        }
      >
        {unauthorized
          ? "Bạn không có quyền truy cập hoặc phiên đăng nhập đã hết hạn."
          : "Không thể tải dữ liệu khóa học từ máy chủ. Đang hiển thị dữ liệu mẫu theo các tầng."}
      </Alert>
    );
  }

  if (!hasData) {
    return (
      <EmptyState
        icon={<AutoStoriesRoundedIcon />}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <Stack spacing={2}>
      {usingSampleData && (
        <Chip
          size="small"
          color="warning"
          variant="outlined"
          label="Đang hiển thị khóa học mẫu theo 3 tầng"
        />
      )}
      {children}
    </Stack>
  );
}

type HeaderWithBackProps = {
  title: string;
  onBack: () => void;
  backText: string;
};

export function HeaderWithBack({ title, onBack, backText }: HeaderWithBackProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Button
        size="large"
        startIcon={<ArrowBackRoundedIcon fontSize="medium" />}
        onClick={onBack}
        className="text-base font-semibold normal-case"
      >
        {backText}
      </Button>
      <Divider flexItem orientation="vertical" />
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
    </Stack>
  );
}

const normalizeThumbnailUrl = (rawUrl: string | null) => {
  if (!rawUrl) {
    return null;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace("www.", "");

    if (host === "drive.google.com" || host === "docs.google.com") {
      const filePathMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
      const fileId = filePathMatch?.[1] ?? url.searchParams.get("id");

      if (fileId) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
      }
    }

    return trimmed;
  } catch {
    return trimmed;
  }
};

type CourseThumbnailProps = {
  title: string;
  thumbnailUrl: string | null;
};

function CourseThumbnail({ title, thumbnailUrl }: CourseThumbnailProps) {
  const [hasError, setHasError] = React.useState(false);
  const resolvedUrl = React.useMemo(() => normalizeThumbnailUrl(thumbnailUrl), [thumbnailUrl]);
  return (
    <Avatar
      src={!hasError && resolvedUrl ? resolvedUrl : ""}
      alt={title}
      imgProps={{ onError: () => setHasError(true) }}
      className="absolute bottom-4 right-4 h-14 w-14 border border-white/80 bg-slate-100 text-slate-500 shadow-md"
    >
      <AutoStoriesRoundedIcon fontSize="small" />
    </Avatar>
  );
}

type CourseCardProps = {
  course: CourseTree;
  lessonCount: number;
  onSelect: (courseId: number) => void;
};

export const CourseCard = React.memo(function CourseCard({
  course,
  lessonCount,
  onSelect,
}: CourseCardProps) {
  return (
    <Paper
      elevation={0}
      onClick={() => onSelect(course.id)}
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
          <Chip size="small" label={`${lessonCount} bài học`} />
        </Stack>
      </div>
      <CourseThumbnail title={course.name} thumbnailUrl={course.thumbnailUrl} />
    </Paper>
  );
});

type ChapterCardProps = {
  chapter: CourseChapter;
  onSelect: (chapterId: number) => void;
};

export const ChapterCard = React.memo(function ChapterCard({
  chapter,
  onSelect,
}: ChapterCardProps) {
  return (
    <Paper
      elevation={0}
      onClick={() => onSelect(chapter.id)}
      className="cursor-pointer rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 transition hover:border-blue-200"
    >
      <Stack spacing={1}>
        <Typography variant="subtitle1" fontWeight={700}>
          {chapter.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {chapter.description ?? "Không có mô tả cho chương này."}
        </Typography>
      </Stack>
    </Paper>
  );
});

type SectionCardProps = {
  sectionType: SectionType;
  section: CourseSection | null;
  onSelect: (type: SectionType) => void;
};

export const SectionCard = React.memo(function SectionCard({
  sectionType,
  section,
  onSelect,
}: SectionCardProps) {
  const meta = SECTION_META[sectionType];

  return (
    <Paper
      elevation={0}
      onClick={() => {
        if (section) {
          onSelect(sectionType);
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
          <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${meta.colorClass}`}>
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
            color={section && section.status !== "UNDER_DEVELOPMENT" ? "primary" : "default"}
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
});

type LessonCardProps = {
  lesson: CourseLesson;
  onSelect: (lessonId: number) => void;
};

export const LessonCard = React.memo(function LessonCard({ lesson, onSelect }: LessonCardProps) {
  return (
    <Paper
      elevation={0}
      onClick={() => onSelect(lesson.id)}
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
  );
});

type LessonListItemProps = {
  lesson: CourseLesson;
  active: boolean;
  onSelect: (lessonId: number) => void;
};

export const LessonListItem = React.memo(function LessonListItem({
  lesson,
  active,
  onSelect,
}: LessonListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(lesson.id)}
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
});

const getVideoEmbedUrl = (rawUrl: string) => {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace("www.", "");

    if (host === "drive.google.com") {
      const match = url.pathname.match(/\/file\/d\/([^/]+)\/?/);
      const fileId = match?.[1] ?? url.searchParams.get("id");
      return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
    }

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

const getVideoPlaybackUrl = (rawValue: string) => {
  const value = rawValue.trim();
  if (!value) {
    return null;
  }

  if (/^\d+$/.test(value)) {
    return `${getBackendApiUrl()}/api/v1/videos/${value}/stream`;
  }

  if (/^\/api\/v1\/videos\/\d+\/stream$/.test(value)) {
    return `${getBackendApiUrl()}${value}`;
  }

  return value;
};

const getPdfEmbedUrl = (rawUrl: string) => {
  const withPageWidthZoom = (url: string) =>
    url.includes("#") ? `${url}&zoom=page-width` : `${url}#zoom=page-width`;

  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace("www.", "");

    if (host === "drive.google.com") {
      const match = url.pathname.match(/\/file\/d\/([^/]+)\/?/);
      const fileId = match?.[1] ?? url.searchParams.get("id");
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }

    const isDirectPdf = url.pathname.toLowerCase().endsWith(".pdf");
    if (!isDirectPdf) {
      return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(rawUrl)}&hl=vi`;
    }
  } catch {
    return rawUrl;
  }

  return withPageWidthZoom(rawUrl);
};

type LessonVideoProps = {
  lesson: CourseLesson;
};

export const LessonVideo = React.memo(function LessonVideo({ lesson }: LessonVideoProps) {
  const playbackUrl = React.useMemo(
    () => (lesson.videoUrl ? getVideoPlaybackUrl(lesson.videoUrl) : null),
    [lesson.videoUrl],
  );
  const embedUrl = React.useMemo(
    () => (playbackUrl ? getVideoEmbedUrl(playbackUrl) : null),
    [playbackUrl],
  );

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
          ) : playbackUrl ? (
            <video controls src={playbackUrl} className="aspect-video w-full bg-black" />
          ) : (
            <div className="flex aspect-video items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-900">
              Video chưa được cập nhật
            </div>
          )}
        </div>
      </Stack>
    </Paper>
  );
});

type LessonPdfProps = {
  lesson: CourseLesson;
};

export const LessonPdf = React.memo(function LessonPdf({ lesson }: LessonPdfProps) {
  const embedUrl = React.useMemo(
    () => (lesson.pdfUrl ? getPdfEmbedUrl(lesson.pdfUrl) : null),
    [lesson.pdfUrl],
  );

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
          {embedUrl ? (
            <iframe
              title={`pdf-${lesson.id}`}
              src={embedUrl}
              className="block h-[660px] w-full bg-white"
              style={{ width: "100%", border: 0 }}
            />
          ) : (
            <div className="flex h-[220px] items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-900">
              Chưa có tài liệu PDF cho bài học này
            </div>
          )}
        </div>
      </Stack>
    </Paper>
  );
});
