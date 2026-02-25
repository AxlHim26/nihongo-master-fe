"use client";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import FontDownloadRoundedIcon from "@mui/icons-material/FontDownloadRounded";
import GraphicEqRoundedIcon from "@mui/icons-material/GraphicEqRounded";
import ImportContactsRoundedIcon from "@mui/icons-material/ImportContactsRounded";
import LibraryBooksRoundedIcon from "@mui/icons-material/LibraryBooksRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
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

export const SECTION_ORDER: SectionType[] = [
  "VOCABULARY",
  "GRAMMAR",
  "KANJI",
  "READING",
  "LISTENING",
];
const NESTED_CARD_HEIGHT_CLASS = "h-[128px]";

export const SECTION_META: Record<
  SectionType,
  { title: string; description: string; icon: React.ReactNode; colorClass: string }
> = {
  VOCABULARY: {
    title: "Từ vựng",
    description: "Mở rộng vốn từ qua video và tài liệu học tập",
    icon: <LibraryBooksRoundedIcon fontSize="small" />,
    colorClass: "bg-blue-50 text-blue-700 dark:bg-white/10 dark:text-slate-200",
  },
  GRAMMAR: {
    title: "Ngữ pháp",
    description: "Hiểu cấu trúc câu và cách diễn đạt theo ngữ cảnh",
    icon: <EditNoteRoundedIcon fontSize="small" />,
    colorClass: "bg-blue-50 text-blue-700 dark:bg-white/10 dark:text-slate-200",
  },
  KANJI: {
    title: "Hán Tự",
    description: "Ghi nhớ Kanji theo bài học có hệ thống",
    icon: <FontDownloadRoundedIcon fontSize="small" />,
    colorClass: "bg-blue-50 text-blue-700 dark:bg-white/10 dark:text-slate-200",
  },
  READING: {
    title: "Đọc",
    description: "Luyện đọc hiểu theo ngữ cảnh thực tế",
    icon: <ImportContactsRoundedIcon fontSize="small" />,
    colorClass: "bg-blue-50 text-blue-700 dark:bg-white/10 dark:text-slate-200",
  },
  LISTENING: {
    title: "Nghe",
    description: "Luyện nghe với hội thoại và bài tập thực hành",
    icon: <GraphicEqRoundedIcon fontSize="small" />,
    colorClass: "bg-blue-50 text-blue-700 dark:bg-white/10 dark:text-slate-200",
  },
};

type CourseStateProps = {
  isLoading: boolean;
  isError: boolean;
  unauthorized: boolean;
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
          : "Không thể tải dữ liệu khóa học từ máy chủ. Vui lòng thử lại sau."}
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

  return <Stack spacing={2}>{children}</Stack>;
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
      className="group relative h-[260px] cursor-pointer overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:hover:border-[var(--app-active-border)] dark:hover:bg-[var(--app-surface-2)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_42%),linear-gradient(160deg,rgba(15,23,42,0.03),transparent_55%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_42%),linear-gradient(160deg,rgba(255,255,255,0.03),transparent_55%)]" />
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
      className={`${NESTED_CARD_HEIGHT_CLASS} cursor-pointer rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md dark:hover:border-[var(--app-active-border)] dark:hover:bg-[var(--app-surface-2)]`}
    >
      <Stack spacing={1} className="h-full">
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
      className={`${NESTED_CARD_HEIGHT_CLASS} rounded-2xl border p-4 transition ${
        section
          ? "cursor-pointer border-[var(--app-border)] bg-[var(--app-card)] duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md dark:hover:border-[var(--app-active-border)] dark:hover:bg-[var(--app-surface-2)]"
          : "cursor-not-allowed border-dashed border-[var(--app-border)] bg-[var(--app-card)] opacity-70"
      }`}
    >
      <Stack spacing={1.5} className="h-full">
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
      className={`${NESTED_CARD_HEIGHT_CLASS} cursor-pointer rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md dark:hover:border-[var(--app-active-border)] dark:hover:bg-[var(--app-surface-2)]`}
    >
      <Stack spacing={1} className="h-full justify-between">
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
          ? "border-blue-300 bg-blue-50 dark:border-[var(--app-active-border)] dark:bg-[var(--app-active-bg)]"
          : "border-[var(--app-border)] duration-200 hover:-translate-y-px hover:border-blue-200 hover:bg-slate-50 hover:shadow-sm dark:hover:border-[var(--app-active-border)] dark:hover:bg-[var(--app-surface-2)]"
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

const getGoogleDriveEmbedUrl = (rawUrl: string) => {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace("www.", "");
    if (host !== "drive.google.com" && host !== "docs.google.com") {
      return null;
    }

    const filePathMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
    const fileId = filePathMatch?.[1] ?? url.searchParams.get("id");
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    const folderPathMatch = url.pathname.match(/\/drive\/folders\/([^/]+)/);
    const folderId = folderPathMatch?.[1];
    if (folderId) {
      return `https://drive.google.com/embeddedfolderview?id=${folderId}#list`;
    }
  } catch {
    return null;
  }

  return null;
};

const getPdfEmbedUrl = (rawUrl: string) => {
  const value = rawUrl.trim();
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const host = url.hostname.replace("www.", "");

    if (host === "drive.google.com" || host === "docs.google.com") {
      const filePathMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
      const fileId = filePathMatch?.[1] ?? url.searchParams.get("id");
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview?rm=minimal`;
      }
    }

    if (url.pathname.toLowerCase().endsWith(".pdf")) {
      return value.includes("#")
        ? `${value}&toolbar=0&navpanes=0&scrollbar=0&zoom=page-width`
        : `${value}#toolbar=0&navpanes=0&scrollbar=0&zoom=page-width`;
    }

    return `https://docs.google.com/gview?embedded=1&hl=vi&url=${encodeURIComponent(value)}`;
  } catch {
    return `https://docs.google.com/gview?embedded=1&hl=vi&url=${encodeURIComponent(value)}`;
  }
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
  const driveEmbedUrl = React.useMemo(
    () => (playbackUrl ? getGoogleDriveEmbedUrl(playbackUrl) : null),
    [playbackUrl],
  );
  const iframeSrc = embedUrl ?? driveEmbedUrl;

  return (
    <Paper
      elevation={0}
      className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-4"
    >
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight={700}>
          {lesson.title}
        </Typography>
        <div>
          {iframeSrc ? (
            <iframe
              title={`video-${lesson.id}`}
              src={iframeSrc}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; web-share"
              allowFullScreen
            />
          ) : playbackUrl ? (
            <video
              controls
              src={playbackUrl}
              className="aspect-video w-full bg-black"
              disablePictureInPicture
              disableRemotePlayback
              controlsList="nodownload noplaybackrate noremoteplayback nopictureinpicture"
              playsInline
            />
          ) : (
            <div className="flex aspect-video items-center justify-center bg-slate-100 text-slate-500 dark:bg-[#1A2231]">
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
              key={`pdf-viewer-${lesson.id}-${embedUrl}`}
              title={`pdf-${lesson.id}`}
              src={embedUrl}
              className="block h-[420px] w-full bg-white sm:h-[520px] lg:h-[660px]"
              style={{ width: "100%", border: 0 }}
              sandbox="allow-same-origin allow-scripts"
            />
          ) : (
            <div className="flex h-[220px] items-center justify-center bg-slate-100 text-slate-500 dark:bg-[#1A2231]">
              Chưa có tài liệu PDF cho bài học này
            </div>
          )}
        </div>
      </Stack>
    </Paper>
  );
});
