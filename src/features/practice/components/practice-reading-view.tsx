"use client";

import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import VerticalAlignBottomRoundedIcon from "@mui/icons-material/VerticalAlignBottomRounded";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Popover from "@mui/material/Popover";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { useShallow } from "zustand/react/shallow";

import {
  annotateReadingLines,
  explainReadingWord,
  generateReadingExercise,
} from "@/features/practice/services/reading-service";
import { usePracticeStore } from "@/features/practice/stores/practice-store";
import { type ProficiencyLevel, proficiencyLevelOptions } from "@/features/practice/types/agent";
import type {
  ReadingAnnotationItem,
  ReadingExercise,
  ReadingQuestion,
  ReadingWordExplanation,
} from "@/features/practice/types/reading";
import EmptyState from "@/shared/components/ui/empty-state";

const japaneseWordPattern = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}々ヶヵー]/u;

const toWordKey = (word: string, context: string) => `${word}::${context}`;

const getReadingToggleButtonSx = (active: boolean) => ({
  minWidth: 88,
  height: 34,
  borderRadius: "999px",
  border: "1px solid var(--app-border)",
  px: 1.4,
  textTransform: "none",
  fontSize: "0.78rem",
  fontWeight: 700,
  color: active ? "var(--app-fg)" : "var(--app-fg-muted)",
  backgroundColor: active ? "var(--app-active-bg)" : "transparent",
  boxShadow: "none",
  "& .MuiSvgIcon-root": {
    fontSize: "0.95rem",
  },
  "&:hover": {
    borderColor: "var(--app-active-border)",
    backgroundColor: "var(--app-surface-2)",
    boxShadow: "none",
  },
  "&.Mui-disabled": {
    borderColor: "var(--app-border)",
    color: "var(--app-muted)",
    opacity: 0.62,
  },
});

const startTestButtonSx = {
  height: 44,
  borderRadius: "0.85rem",
  border: "1px solid var(--app-active-border)",
  textTransform: "none",
  fontWeight: 700,
  letterSpacing: 0.1,
  color: "var(--app-fg)",
  backgroundColor: "var(--app-active-bg)",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "var(--app-surface-2)",
    boxShadow: "none",
  },
  "&.Mui-disabled": {
    borderColor: "var(--app-border)",
    backgroundColor: "var(--app-surface-2)",
    color: "var(--app-muted)",
    opacity: 0.75,
  },
} as const;

const toScaledRem = (baseRem: number, scale: number) => `${(baseRem * scale).toFixed(3)}rem`;

type WordPopupState = {
  anchor: { top: number; left: number } | null;
  selectedWord: string;
  contextLine: string;
  loading: boolean;
  error: string | null;
  data: ReadingWordExplanation | null;
};

const defaultWordPopupState: WordPopupState = {
  anchor: null,
  selectedWord: "",
  contextLine: "",
  loading: false,
  error: null,
  data: null,
};

export default function PracticeReadingView() {
  const { proficiencyLevel, updateAgentSettings } = usePracticeStore(
    useShallow((state) => ({
      proficiencyLevel: state.agentSettings.proficiencyLevel,
      updateAgentSettings: state.updateAgentSettings,
    })),
  );

  const [exercise, setExercise] = React.useState<ReadingExercise | null>(null);
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<string, string>>({});
  const [explanationDialogQuestionId, setExplanationDialogQuestionId] = React.useState<
    string | null
  >(null);
  const [showRomaji, setShowRomaji] = React.useState(false);
  const [showTranslation, setShowTranslation] = React.useState(false);
  const [lineAnnotations, setLineAnnotations] = React.useState<ReadingAnnotationItem[]>([]);
  const [wordPopup, setWordPopup] = React.useState<WordPopupState>(defaultWordPopupState);
  const [wordCache, setWordCache] = React.useState<Record<string, ReadingWordExplanation>>({});
  const [fontScale, setFontScale] = React.useState(1);

  const generateMutation = useMutation({
    mutationFn: generateReadingExercise,
    onSuccess: (nextExercise) => {
      setExercise(nextExercise);
      setSelectedAnswers({});
      setExplanationDialogQuestionId(null);
      setShowRomaji(false);
      setShowTranslation(false);
      setLineAnnotations([]);
      setWordPopup(defaultWordPopupState);
    },
  });

  const annotateMutation = useMutation({
    mutationFn: annotateReadingLines,
    onSuccess: (items) => {
      setLineAnnotations(items);
    },
  });

  const explainWordMutation = useMutation({
    mutationFn: ({ word, context }: { word: string; context: string }) =>
      explainReadingWord(word, context),
  });

  const buildLocalFallbackAnnotations = React.useCallback(
    (lines: string[]) =>
      lines.map((line) => ({
        line,
        romaji: line,
        translation: line,
      })),
    [],
  );

  const answeredCount = React.useMemo(() => Object.keys(selectedAnswers).length, [selectedAnswers]);

  const correctCount = React.useMemo(() => {
    if (!exercise) {
      return 0;
    }
    return exercise.questions.reduce((count, question) => {
      if (selectedAnswers[question.id] === question.correctOptionId) {
        return count + 1;
      }
      return count;
    }, 0);
  }, [exercise, selectedAnswers]);

  const hasVisibleRomaji = React.useMemo(() => {
    if (!exercise) {
      return false;
    }
    return lineAnnotations.some((item, index) => {
      const line = exercise.passageLines[index] ?? "";
      return item?.romaji?.trim().length > 0 && item.romaji.trim() !== line.trim();
    });
  }, [exercise, lineAnnotations]);

  const hasVisibleTranslation = React.useMemo(() => {
    if (!exercise) {
      return false;
    }
    return lineAnnotations.some((item, index) => {
      const line = exercise.passageLines[index] ?? "";
      return item?.translation?.trim().length > 0 && item.translation.trim() !== line.trim();
    });
  }, [exercise, lineAnnotations]);

  const ensureAnnotation = React.useCallback(async () => {
    if (
      !exercise ||
      annotateMutation.isPending ||
      lineAnnotations.length >= exercise.passageLines.length
    ) {
      return;
    }
    try {
      await annotateMutation.mutateAsync(exercise.passageLines);
    } catch {
      setLineAnnotations(buildLocalFallbackAnnotations(exercise.passageLines));
    }
  }, [annotateMutation, buildLocalFallbackAnnotations, exercise, lineAnnotations.length]);

  const handleStartTest = React.useCallback(() => {
    generateMutation.mutate(proficiencyLevel);
  }, [generateMutation, proficiencyLevel]);

  const handleSelectOption = React.useCallback((questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }, []);

  const openExplanationDialog = React.useCallback((questionId: string) => {
    setExplanationDialogQuestionId(questionId);
  }, []);

  const closeExplanationDialog = React.useCallback(() => {
    setExplanationDialogQuestionId(null);
  }, []);

  const handleToggleRomaji = React.useCallback(async () => {
    const next = !showRomaji;
    setShowRomaji(next);
    if (next) {
      await ensureAnnotation();
    }
  }, [ensureAnnotation, showRomaji]);

  const handleToggleTranslation = React.useCallback(async () => {
    const next = !showTranslation;
    setShowTranslation(next);
    if (next) {
      await ensureAnnotation();
    }
  }, [ensureAnnotation, showTranslation]);

  const handleLevelChange = React.useCallback(
    (value: string) => {
      updateAgentSettings({
        proficiencyLevel: value as ProficiencyLevel,
      });
    },
    [updateAgentSettings],
  );

  const handleFontScaleChange = React.useCallback((_event: Event, value: number | number[]) => {
    const nextValue = Array.isArray(value) ? value[0] : value;
    if (typeof nextValue === "number") {
      setFontScale(nextValue);
    }
  }, []);

  const closeWordPopup = React.useCallback(() => {
    setWordPopup(defaultWordPopupState);
    if (typeof window !== "undefined") {
      window.getSelection()?.removeAllRanges();
    }
  }, []);

  const openWordPopup = React.useCallback(
    async (event: React.MouseEvent<HTMLElement>, contextLine: string) => {
      const selectedRaw = typeof window !== "undefined" ? window.getSelection()?.toString() : "";
      const selectedWord =
        selectedRaw?.trim().replace(/[「」『』【】（）()、。！？!?・….,]/g, "") ?? "";

      if (!selectedWord || selectedWord.length > 24 || !japaneseWordPattern.test(selectedWord)) {
        return;
      }

      const anchor = {
        top: event.clientY + 14,
        left: event.clientX + 10,
      };

      const cacheKey = toWordKey(selectedWord, contextLine);
      const cached = wordCache[cacheKey];

      if (cached) {
        setWordPopup({
          anchor,
          selectedWord,
          contextLine,
          loading: false,
          error: null,
          data: cached,
        });
        return;
      }

      setWordPopup({
        anchor,
        selectedWord,
        contextLine,
        loading: true,
        error: null,
        data: null,
      });

      try {
        const result = await explainWordMutation.mutateAsync({
          word: selectedWord,
          context: contextLine,
        });

        setWordCache((prev) => ({
          ...prev,
          [cacheKey]: result,
        }));

        setWordPopup({
          anchor,
          selectedWord,
          contextLine,
          loading: false,
          error: null,
          data: result,
        });
      } catch (error) {
        setWordPopup({
          anchor,
          selectedWord,
          contextLine,
          loading: false,
          error: error instanceof Error ? error.message : "Không thể tra từ lúc này.",
          data: null,
        });
      }
    },
    [explainWordMutation, wordCache],
  );

  const explanationQuestion = React.useMemo(
    () =>
      exercise?.questions.find((question) => question.id === explanationDialogQuestionId) ?? null,
    [exercise, explanationDialogQuestionId],
  );
  const explanationAnswer = explanationQuestion
    ? selectedAnswers[explanationQuestion.id]
    : undefined;
  const explanationIsCorrect =
    explanationQuestion && explanationAnswer
      ? explanationAnswer === explanationQuestion.correctOptionId
      : false;

  return (
    <Stack spacing={3} className="pb-6">
      <Typography variant="h4" fontWeight={700}>
        Luyện đọc
      </Typography>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Paper
          elevation={0}
          className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 sm:p-5"
        >
          {!exercise ? (
            <EmptyState
              icon={<AutoStoriesRoundedIcon />}
              title="Sẵn sàng làm bài đọc"
              description="Chọn trình độ ở hộp cài đặt và bấm bắt đầu để AI tạo đề đọc + 5 câu hỏi."
            />
          ) : (
            <Stack spacing={3}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    className="text-[var(--app-fg)]"
                    sx={{ fontSize: toScaledRem(1.25, fontScale) }}
                  >
                    {exercise.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: toScaledRem(0.875, fontScale) }}
                  >
                    Trình độ {exercise.level} · Đã làm {answeredCount}/{exercise.questions.length}{" "}
                    câu
                  </Typography>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="small"
                    variant="contained"
                    disableElevation
                    startIcon={<VerticalAlignBottomRoundedIcon fontSize="small" />}
                    onClick={() => void handleToggleRomaji()}
                    disabled={annotateMutation.isPending}
                    sx={{
                      ...getReadingToggleButtonSx(showRomaji),
                      fontSize: toScaledRem(0.78, fontScale),
                    }}
                  >
                    Romaji
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    disableElevation
                    startIcon={<TranslateRoundedIcon fontSize="small" />}
                    onClick={() => void handleToggleTranslation()}
                    disabled={annotateMutation.isPending}
                    sx={{
                      ...getReadingToggleButtonSx(showTranslation),
                      fontSize: toScaledRem(0.78, fontScale),
                    }}
                  >
                    Dịch
                  </Button>
                </div>
              </div>

              <Paper
                elevation={0}
                className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4"
              >
                <Stack spacing={2.5}>
                  {exercise.passageLines.map((line, index) => {
                    const annotation = lineAnnotations[index];
                    const romajiText = annotation?.romaji?.trim() ?? "";
                    const translationText = annotation?.translation?.trim() ?? "";
                    const hasRomaji = romajiText.length > 0 && romajiText !== line.trim();
                    const hasTranslation =
                      translationText.length > 0 && translationText !== line.trim();
                    return (
                      <div key={`${exercise.id}-line-${index}`}>
                        <Typography
                          variant="body1"
                          className="leading-8 text-[var(--app-fg)]"
                          sx={{ fontSize: toScaledRem(1, fontScale) }}
                          onDoubleClick={(event) => void openWordPopup(event, line)}
                        >
                          {line}
                        </Typography>
                        {showRomaji && hasRomaji ? (
                          <Typography
                            variant="caption"
                            className="mt-0.5 block leading-6 text-[var(--app-muted)]"
                            sx={{ fontSize: toScaledRem(0.78, fontScale) }}
                          >
                            {romajiText}
                          </Typography>
                        ) : null}
                        {showTranslation && hasTranslation ? (
                          <Typography
                            variant="body2"
                            className="mt-1 border-l-2 border-slate-300/80 pl-2 italic text-[var(--app-muted)] dark:border-slate-600"
                            sx={{ fontSize: toScaledRem(0.95, fontScale) }}
                          >
                            {translationText}
                          </Typography>
                        ) : null}
                      </div>
                    );
                  })}

                  {annotateMutation.isPending ? (
                    <div className="flex items-center gap-2 text-[var(--app-muted)]">
                      <CircularProgress size={14} />
                      <Typography variant="caption" sx={{ fontSize: toScaledRem(0.78, fontScale) }}>
                        Đang xử lý romaji và bản dịch...
                      </Typography>
                    </div>
                  ) : null}

                  {!annotateMutation.isPending &&
                  showRomaji &&
                  lineAnnotations.length > 0 &&
                  !hasVisibleRomaji ? (
                    <Typography
                      variant="caption"
                      className="text-amber-500"
                      sx={{ fontSize: toScaledRem(0.78, fontScale) }}
                    >
                      Chưa lấy được romaji từ AI cho bài này, bạn bấm tạo đề mới để thử lại.
                    </Typography>
                  ) : null}

                  {!annotateMutation.isPending &&
                  showTranslation &&
                  lineAnnotations.length > 0 &&
                  !hasVisibleTranslation ? (
                    <Typography
                      variant="caption"
                      className="text-amber-500"
                      sx={{ fontSize: toScaledRem(0.78, fontScale) }}
                    >
                      Chưa lấy được bản dịch từ AI cho bài này, bạn bấm tạo đề mới để thử lại.
                    </Typography>
                  ) : null}
                </Stack>
              </Paper>

              <Divider />

              <div className="grid gap-3">
                {exercise.questions.map((question) => (
                  <ReadingQuestionCard
                    key={question.id}
                    question={question}
                    fontScale={fontScale}
                    selectedOptionId={selectedAnswers[question.id]}
                    onSelectOption={handleSelectOption}
                    onOpenExplanation={openExplanationDialog}
                  />
                ))}
              </div>

              <Alert
                icon={<CheckCircleRoundedIcon fontSize="inherit" />}
                severity={correctCount === exercise.questions.length ? "success" : "info"}
                sx={{ "& .MuiAlert-message": { fontSize: toScaledRem(0.9, fontScale) } }}
              >
                Kết quả hiện tại: <strong>{correctCount}</strong> / {exercise.questions.length} câu
                đúng.
              </Alert>
            </Stack>
          )}
        </Paper>

        <Paper
          elevation={0}
          className="h-fit rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 sm:p-5 xl:sticky xl:top-5"
        >
          <Stack spacing={2.5}>
            <Typography variant="h6" fontWeight={700}>
              Cài đặt bài đọc
            </Typography>

            <FormControl size="small" fullWidth>
              <InputLabel id="reading-level-label">Trình độ</InputLabel>
              <Select
                labelId="reading-level-label"
                value={proficiencyLevel}
                label="Trình độ"
                onChange={(event) => handleLevelChange(event.target.value)}
              >
                {proficiencyLevelOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack spacing={0.8}>
              <div className="flex items-center justify-between">
                <Typography variant="body2" color="text.secondary">
                  Cỡ chữ
                </Typography>
                <Typography variant="caption" className="text-[var(--app-muted)]">
                  {Math.round(fontScale * 100)}%
                </Typography>
              </div>
              <Slider
                size="small"
                value={fontScale}
                min={0.85}
                max={1.5}
                step={0.05}
                onChange={handleFontScaleChange}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
              />
            </Stack>

            <Button
              variant="contained"
              disableElevation
              onClick={handleStartTest}
              disabled={generateMutation.isPending}
              sx={startTestButtonSx}
            >
              {generateMutation.isPending ? "Đang tạo đề..." : "Bắt đầu làm bài kiểm tra"}
            </Button>

            <Typography variant="body2" color="text.secondary">
              Mẹo: đúp vào từ tiếng Nhật trong bài đọc để xem nghĩa tiếng Việt + ví dụ.
            </Typography>

            {generateMutation.isError ? (
              <Alert severity="error">
                {generateMutation.error instanceof Error
                  ? generateMutation.error.message
                  : "Không thể tạo đề đọc."}
              </Alert>
            ) : null}
          </Stack>
        </Paper>
      </div>

      <Popover
        open={Boolean(wordPopup.anchor)}
        onClose={closeWordPopup}
        anchorReference="anchorPosition"
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        {...(wordPopup.anchor ? { anchorPosition: wordPopup.anchor } : {})}
        PaperProps={{
          className:
            "w-[min(92vw,360px)] rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-4",
        }}
      >
        <Stack spacing={1.2}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ fontSize: toScaledRem(1, fontScale) }}
          >
            {wordPopup.selectedWord || "Tra từ"}
          </Typography>

          {wordPopup.loading ? (
            <div className="flex items-center gap-2 py-1 text-[var(--app-muted)]">
              <CircularProgress size={14} />
              <Typography variant="body2" sx={{ fontSize: toScaledRem(0.92, fontScale) }}>
                Đang tra nghĩa...
              </Typography>
            </div>
          ) : null}

          {wordPopup.error ? (
            <Alert
              severity="error"
              sx={{ "& .MuiAlert-message": { fontSize: toScaledRem(0.88, fontScale) } }}
            >
              {wordPopup.error}
            </Alert>
          ) : null}

          {!wordPopup.loading && wordPopup.data ? (
            <>
              <Typography
                variant="body2"
                className="text-[var(--app-muted)]"
                sx={{ fontSize: toScaledRem(0.9, fontScale) }}
              >
                Cách đọc: {wordPopup.data.reading}
              </Typography>
              <Typography
                variant="body2"
                className="leading-6 text-[var(--app-fg)]"
                sx={{ fontSize: toScaledRem(0.95, fontScale) }}
              >
                {wordPopup.data.meaningVi}
              </Typography>

              <Divider />

              <Typography
                variant="caption"
                className="font-semibold text-[var(--app-muted)]"
                sx={{ fontSize: toScaledRem(0.76, fontScale) }}
              >
                Ví dụ
              </Typography>
              <Typography
                variant="body2"
                className="leading-6 text-[var(--app-fg)]"
                sx={{ fontSize: toScaledRem(0.95, fontScale) }}
              >
                {wordPopup.data.exampleJa}
              </Typography>
              <Typography
                variant="body2"
                className="italic text-[var(--app-muted)]"
                sx={{ fontSize: toScaledRem(0.95, fontScale) }}
              >
                {wordPopup.data.exampleVi}
              </Typography>
            </>
          ) : null}
        </Stack>
      </Popover>

      <Dialog
        open={Boolean(explanationQuestion)}
        onClose={closeExplanationDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          className: "rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)]",
        }}
      >
        <DialogTitle className="border-b border-[var(--app-border)] pb-3">
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ fontSize: toScaledRem(1, fontScale) }}
          >
            Giải thích chi tiết
          </Typography>
        </DialogTitle>

        <DialogContent className="space-y-3 py-4">
          {explanationQuestion ? (
            <>
              <Typography
                variant="body1"
                className="leading-7 text-[var(--app-fg)]"
                sx={{ fontSize: toScaledRem(1, fontScale) }}
              >
                {explanationQuestion.question}
              </Typography>

              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
                <Typography
                  variant="caption"
                  className="text-[var(--app-muted)]"
                  sx={{ fontSize: toScaledRem(0.76, fontScale) }}
                >
                  Đáp án đúng
                </Typography>
                <Typography
                  variant="body2"
                  className="mt-1 text-[var(--app-fg)]"
                  sx={{ fontSize: toScaledRem(0.92, fontScale) }}
                >
                  {explanationQuestion.correctOptionId}.{" "}
                  {
                    explanationQuestion.options.find(
                      (option) => option.id === explanationQuestion.correctOptionId,
                    )?.text
                  }
                </Typography>
              </div>

              {explanationAnswer ? (
                <Typography
                  variant="caption"
                  className={explanationIsCorrect ? "text-emerald-500" : "text-rose-500"}
                  sx={{ fontSize: toScaledRem(0.78, fontScale) }}
                >
                  {explanationIsCorrect
                    ? "Bạn đã chọn đúng đáp án."
                    : `Bạn đã chọn ${explanationAnswer}. Hãy so sánh lại với đáp án đúng ở trên.`}
                </Typography>
              ) : null}

              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
                <Typography
                  variant="caption"
                  className="font-semibold text-[var(--app-muted)]"
                  sx={{ fontSize: toScaledRem(0.76, fontScale) }}
                >
                  日本語
                </Typography>
                <Typography
                  variant="body2"
                  className="mt-1 leading-6 text-[var(--app-fg)]"
                  sx={{ fontSize: toScaledRem(0.95, fontScale) }}
                >
                  {explanationQuestion.explanationJa}
                </Typography>
              </div>

              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
                <Typography
                  variant="caption"
                  className="font-semibold text-[var(--app-muted)]"
                  sx={{ fontSize: toScaledRem(0.76, fontScale) }}
                >
                  Tiếng Việt
                </Typography>
                <Typography
                  variant="body2"
                  className="mt-1 leading-6 text-[var(--app-fg)]"
                  sx={{ fontSize: toScaledRem(0.95, fontScale) }}
                >
                  {explanationQuestion.explanationVi}
                </Typography>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

type ReadingQuestionCardProps = {
  question: ReadingQuestion;
  fontScale: number;
  selectedOptionId: string | undefined;
  onSelectOption: (questionId: string, optionId: string) => void;
  onOpenExplanation: (questionId: string) => void;
};

function ReadingQuestionCard({
  question,
  fontScale,
  selectedOptionId,
  onSelectOption,
  onOpenExplanation,
}: ReadingQuestionCardProps) {
  const hasAnswered = typeof selectedOptionId === "string";
  const answeredCorrectly = selectedOptionId === question.correctOptionId;

  return (
    <Paper
      elevation={0}
      className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3"
    >
      <Stack spacing={1.5}>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          className="leading-6 text-[var(--app-fg)]"
          sx={{ fontSize: toScaledRem(0.95, fontScale) }}
        >
          {question.question}
        </Typography>

        <div className="grid gap-2">
          {question.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrect = option.id === question.correctOptionId;

            const stateClassName = isSelected
              ? isCorrect
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/30 dark:text-emerald-200"
                : "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-200"
              : hasAnswered && isCorrect
                ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700/50 dark:bg-blue-950/30 dark:text-blue-200"
                : "border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-fg)] hover:border-[var(--app-active-border)]";

            return (
              <button
                key={`${question.id}-${option.id}`}
                type="button"
                onClick={() => onSelectOption(question.id, option.id)}
                className={`rounded-xl border px-3 py-2 text-left transition ${stateClassName}`}
                style={{ fontSize: toScaledRem(0.92, fontScale) }}
              >
                <span className="mr-2 font-semibold">{option.id}.</span>
                {option.text}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          {hasAnswered ? (
            <Typography
              variant="caption"
              className={answeredCorrectly ? "text-emerald-600" : "text-rose-500"}
              sx={{ fontSize: toScaledRem(0.78, fontScale) }}
            >
              {answeredCorrectly
                ? "Đúng rồi!"
                : `Chưa đúng. Đáp án đúng là ${question.correctOptionId}.`}
            </Typography>
          ) : (
            <div />
          )}

          <Button
            size="small"
            variant="text"
            startIcon={<HelpOutlineRoundedIcon fontSize="small" />}
            disabled={!hasAnswered}
            onClick={() => onOpenExplanation(question.id)}
            sx={{ fontSize: toScaledRem(0.82, fontScale), textTransform: "none" }}
          >
            Giải thích
          </Button>
        </div>
      </Stack>
    </Paper>
  );
}
