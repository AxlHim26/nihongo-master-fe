"use client";

import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  getJlptAttemptSession,
  getJlptExamDetail,
  saveJlptAnswers,
  submitJlptAttempt,
} from "@/features/practice/services/jlpt-service";

type PracticeJlptAttemptViewProps = {
  examId: number;
  attemptId: number;
};

type AnswersState = Record<number, string>;

type ScrollBehavior = "smooth" | "auto";

const formatRemaining = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(safe % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

export default function PracticeJlptAttemptView({
  examId,
  attemptId,
}: PracticeJlptAttemptViewProps) {
  const router = useRouter();
  const sectionRefs = React.useRef<Record<number, HTMLDivElement | null>>({});
  const questionRefs = React.useRef<Record<number, HTMLDivElement | null>>({});

  const examQuery = useQuery({
    queryKey: ["jlpt", "exam", examId],
    queryFn: () => getJlptExamDetail(examId),
  });

  const attemptQuery = useQuery({
    queryKey: ["jlpt", "attempt-session", attemptId],
    queryFn: () => getJlptAttemptSession(attemptId),
  });

  const [answers, setAnswers] = React.useState<AnswersState>({});
  const [remainingSeconds, setRemainingSeconds] = React.useState<number | null>(null);
  const [initializedAttemptId, setInitializedAttemptId] = React.useState<number | null>(null);
  const [activeQuestionId, setActiveQuestionId] = React.useState<number | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = React.useState(false);
  const [showOnlyUnanswered, setShowOnlyUnanswered] = React.useState(false);

  const sections = React.useMemo(() => examQuery.data?.sections ?? [], [examQuery.data?.sections]);
  const allQuestions = React.useMemo(
    () => sections.flatMap((section) => section.questions),
    [sections],
  );
  const filteredSections = React.useMemo(
    () =>
      sections
        .map((section) => ({
          ...section,
          visibleQuestions: showOnlyUnanswered
            ? section.questions.filter((question) => !answers[question.id])
            : section.questions,
        }))
        .filter((section) => !showOnlyUnanswered || section.visibleQuestions.length > 0),
    [answers, sections, showOnlyUnanswered],
  );
  const visibleQuestions = React.useMemo(
    () => filteredSections.flatMap((section) => section.visibleQuestions),
    [filteredSections],
  );

  React.useEffect(() => {
    const attempt = attemptQuery.data;
    const exam = examQuery.data;
    if (!attempt || !exam) {
      return;
    }

    if (initializedAttemptId === attempt.attemptId) {
      return;
    }

    const nextAnswers: AnswersState = {};
    for (const item of attempt.answers) {
      if (item.selectedOptionKey) {
        nextAnswers[item.questionId] = item.selectedOptionKey;
      }
    }

    setAnswers(nextAnswers);
    setRemainingSeconds(attempt.remainingSeconds);
    setInitializedAttemptId(attempt.attemptId);
  }, [attemptQuery.data, examQuery.data, initializedAttemptId]);

  React.useEffect(() => {
    const firstQuestion = examQuery.data?.sections[0]?.questions[0];
    if (firstQuestion && activeQuestionId === null) {
      setActiveQuestionId(firstQuestion.id);
    }
  }, [activeQuestionId, examQuery.data]);

  React.useEffect(() => {
    if (visibleQuestions.length === 0) {
      return;
    }

    if (
      activeQuestionId === null ||
      !visibleQuestions.some((question) => question.id === activeQuestionId)
    ) {
      setActiveQuestionId(visibleQuestions[0].id);
    }
  }, [activeQuestionId, visibleQuestions]);

  React.useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) {
          return prev;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [remainingSeconds]);

  const saveMutation = useMutation({
    mutationFn: (payload: Array<{ questionId: number; selectedOptionKey: string }>) =>
      saveJlptAnswers(attemptId, payload),
  });

  const submitMutation = useMutation({
    mutationFn: () => submitJlptAttempt(attemptId),
    onSuccess: (data) => {
      router.push(`/practice/jlpt/attempts/${data.attemptId}/result`);
    },
  });

  // Fix O: use a ref for the submit callback to avoid a stale closure where
  // the effect captures an outdated submitMutation object.
  const submitMutationRef = React.useRef(submitMutation);
  React.useEffect(() => {
    submitMutationRef.current = submitMutation;
  });

  React.useEffect(() => {
    if (!remainingSeconds || remainingSeconds > 0) {
      return;
    }
    if (!submitMutationRef.current.isPending) {
      submitMutationRef.current.mutate();
    }
  }, [remainingSeconds]);

  const startedAttemptId = attemptQuery.data?.attemptId;

  React.useEffect(() => {
    if (!startedAttemptId) {
      return;
    }

    const nextExamId = attemptQuery.data?.examId ?? examId;
    if (startedAttemptId !== attemptId || attemptQuery.data?.examId !== examId) {
      router.replace(`/practice/jlpt/tests/${nextExamId}/attempt/${startedAttemptId}`);
    }
  }, [attemptId, examId, router, startedAttemptId, attemptQuery.data?.examId]);

  React.useEffect(() => {
    if (attemptQuery.data?.status === "SUBMITTED") {
      router.replace(`/practice/jlpt/attempts/${attemptId}/result`);
    }
  }, [attemptId, attemptQuery.data?.status, router]);

  // Fix P: skip autosave during the initial hydration pass by tracking whether
  // answers were populated by the server response vs. a user interaction.
  const isHydratedRef = React.useRef(false);
  React.useEffect(() => {
    if (initializedAttemptId !== null) {
      isHydratedRef.current = true;
    }
  }, [initializedAttemptId]);

  React.useEffect(() => {
    if (!isHydratedRef.current) {
      return;
    }

    const keys = Object.keys(answers);
    if (keys.length === 0) {
      return;
    }

    if (startedAttemptId !== attemptId) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const payload = Object.entries(answers).map(([questionId, selectedOptionKey]) => ({
        questionId: Number(questionId),
        selectedOptionKey,
      }));
      saveMutation.mutate(payload);
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [answers, attemptId, saveMutation, startedAttemptId]);

  const handleSelect = React.useCallback((questionId: number, optionKey: string) => {
    setActiveQuestionId(questionId);
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  }, []);

  const handleJumpToQuestion = React.useCallback(
    (questionId: number, behavior: ScrollBehavior = "smooth") => {
      setActiveQuestionId(questionId);
      questionRefs.current[questionId]?.scrollIntoView({ behavior, block: "center" });
    },
    [],
  );

  const handleJumpToSection = React.useCallback((sectionId: number) => {
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  React.useEffect(() => {
    if (visibleQuestions.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length === 0) {
          return;
        }

        const viewportCenter = window.innerHeight / 2;
        const closestEntry = visibleEntries.reduce((best, current) => {
          const bestCenter = best.boundingClientRect.top + best.boundingClientRect.height / 2;
          const currentCenter =
            current.boundingClientRect.top + current.boundingClientRect.height / 2;
          const bestDistance = Math.abs(bestCenter - viewportCenter);
          const currentDistance = Math.abs(currentCenter - viewportCenter);
          return currentDistance < bestDistance ? current : best;
        });

        const questionId = Number((closestEntry.target as HTMLElement).dataset.questionId);
        if (!Number.isNaN(questionId)) {
          setActiveQuestionId((prev) => (prev === questionId ? prev : questionId));
        }
      },
      {
        root: null,
        rootMargin: "-35% 0px -35% 0px",
        threshold: [0.15, 0.35, 0.6],
      },
    );

    for (const question of visibleQuestions) {
      const node = questionRefs.current[question.id];
      if (node) {
        observer.observe(node);
      }
    }

    return () => observer.disconnect();
  }, [visibleQuestions]);

  const handleSubmit = React.useCallback(() => {
    setSubmitDialogOpen(false);
    submitMutation.mutate();
  }, [submitMutation]);

  if (attemptQuery.isError || examQuery.isError) {
    return (
      <Alert severity="error">
        Không tải được phiên làm bài. Có thể bài đã hết giờ, đã nộp, hoặc không còn tồn tại.
      </Alert>
    );
  }

  const isLoading =
    attemptQuery.isLoading || examQuery.isLoading || !examQuery.data || !attemptQuery.data;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-[var(--app-muted)]">
        <CircularProgress size={18} />
        <Typography variant="body2">Đang tải bài thi...</Typography>
      </div>
    );
  }

  if (attemptQuery.data.attemptId !== attemptId) {
    return (
      <div className="flex items-center gap-2 text-[var(--app-muted)]">
        <CircularProgress size={18} />
        <Typography variant="body2">Đang đồng bộ ca thi...</Typography>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const unansweredQuestions = allQuestions.filter((question) => !answers[question.id]);
  const firstUnansweredQuestion = unansweredQuestions[0] ?? null;
  const listeningAssets = examQuery.data.assets.filter(
    (asset) => asset.assetType === "LISTENING_SCRIPT" || asset.assetType === "QUESTION",
  );
  const activeVisibleQuestionIndex = visibleQuestions.findIndex(
    (question) => question.id === activeQuestionId,
  );
  const previousVisibleQuestion =
    activeVisibleQuestionIndex > 0 ? visibleQuestions[activeVisibleQuestionIndex - 1] : null;
  const nextVisibleQuestion =
    activeVisibleQuestionIndex >= 0 && activeVisibleQuestionIndex < visibleQuestions.length - 1
      ? visibleQuestions[activeVisibleQuestionIndex + 1]
      : null;
  const hasRecoveredProgress =
    attemptQuery.data.answers.some((item) => item.selectedOptionKey !== null) ||
    attemptQuery.data.totalDurationMinutes * 60 - attemptQuery.data.remainingSeconds > 15;
  const canSubmit = !submitMutation.isPending;

  return (
    <Stack spacing={3} className="pb-6">
      <Typography variant="h4" fontWeight={700}>
        {examQuery.data.title}
      </Typography>

      {hasRecoveredProgress ? (
        <Alert severity="info">
          Đã khôi phục phiên làm bài trước đó. Thời gian và đáp án được đồng bộ từ máy chủ.
        </Alert>
      ) : null}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {examQuery.data.sections.map((section) => (
          <Chip
            key={`jump-section-${section.id}`}
            label={`Part ${section.sectionOrder}`}
            clickable
            onClick={() => handleJumpToSection(section.id)}
            color="primary"
            variant="outlined"
          />
        ))}
        <Chip
          label={showOnlyUnanswered ? "Đang lọc câu chưa làm" : "Hiện tất cả câu"}
          clickable
          onClick={() => setShowOnlyUnanswered((prev) => !prev)}
          color={showOnlyUnanswered ? "warning" : "default"}
          variant="outlined"
        />
        {firstUnansweredQuestion ? (
          <Chip
            label={`Đến câu ${firstUnansweredQuestion.questionNumber}`}
            clickable
            onClick={() => handleJumpToQuestion(firstUnansweredQuestion.id)}
            color="warning"
            variant="outlined"
          />
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Stack spacing={2.5}>
          {showOnlyUnanswered && filteredSections.length === 0 ? (
            <Paper
              elevation={0}
              className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 sm:p-5"
            >
              <Stack spacing={2}>
                <Alert severity="success">
                  Bạn đã trả lời toàn bộ câu hỏi. Không còn câu nào cần rà lại.
                </Alert>
                <Button
                  variant="outlined"
                  onClick={() => setShowOnlyUnanswered(false)}
                  sx={{ width: "fit-content", textTransform: "none", fontWeight: 700 }}
                >
                  Hiện lại toàn bộ câu hỏi
                </Button>
              </Stack>
            </Paper>
          ) : null}

          {filteredSections.map((section) => (
            <div
              key={section.id}
              ref={(node) => {
                sectionRefs.current[section.id] = node;
              }}
            >
              <Paper
                elevation={0}
                className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 sm:p-5"
              >
                <Stack spacing={2}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Typography variant="h6" fontWeight={700}>
                      Part {section.sectionOrder}: {section.title}
                    </Typography>
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip
                        size="small"
                        label={`${section.questions.filter((question) => answers[question.id]).length}/${section.questions.length} câu`}
                        color="primary"
                        variant="outlined"
                      />
                      {showOnlyUnanswered ? (
                        <Chip
                          size="small"
                          label={`Hiện ${section.visibleQuestions.length} câu chưa làm`}
                          color="warning"
                          variant="outlined"
                        />
                      ) : null}
                    </div>
                  </div>

                  {section.visibleQuestions.map((question) => (
                    <div
                      key={question.id}
                      ref={(node) => {
                        questionRefs.current[question.id] = node;
                      }}
                      data-question-id={question.id}
                      onFocus={() => setActiveQuestionId(question.id)}
                      className={`rounded-xl border bg-[var(--app-surface)] p-3 transition ${
                        activeQuestionId === question.id
                          ? "border-blue-400 ring-1 ring-blue-200"
                          : "border-[var(--app-border)]"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Typography variant="subtitle2" fontWeight={700}>
                          Câu {question.questionNumber}
                        </Typography>
                        <div className="flex flex-wrap items-center gap-2">
                          {activeQuestionId === question.id ? (
                            <Chip size="small" label="Đang xem" color="primary" />
                          ) : null}
                          <Chip
                            size="small"
                            label={
                              answers[question.id]
                                ? `Đã chọn ${answers[question.id]}`
                                : "Chưa trả lời"
                            }
                            color={answers[question.id] ? "success" : "default"}
                            variant={answers[question.id] ? "filled" : "outlined"}
                          />
                        </div>
                      </div>
                      <Typography variant="body2" className="mt-1 text-[var(--app-fg)]">
                        {question.prompt}
                      </Typography>

                      <div className="mt-2 grid gap-2">
                        {question.options.map((option) => {
                          const selected = answers[question.id] === option.key;
                          return (
                            <button
                              key={`${question.id}-${option.key}`}
                              type="button"
                              onClick={() => handleSelect(question.id, option.key)}
                              disabled={submitMutation.isPending}
                              className={`rounded-xl border px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                selected
                                  ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700/50 dark:bg-blue-950/30 dark:text-blue-200"
                                  : "border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-fg)] hover:border-[var(--app-active-border)]"
                              }`}
                            >
                              <span className="mr-2 font-semibold">{option.key}.</span>
                              {option.text}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </Stack>
              </Paper>
            </div>
          ))}
        </Stack>

        <Paper
          elevation={0}
          className="h-fit rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 sm:p-5 xl:sticky xl:top-5"
        >
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={700}>
              Trạng thái bài thi
            </Typography>

            <div className="flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
              <AccessTimeRoundedIcon fontSize="small" />
              <Typography variant="body2" fontWeight={700}>
                {formatRemaining(remainingSeconds ?? 0)}
              </Typography>
            </div>

            <Typography variant="body2" color="text.secondary">
              Đã làm {answeredCount}/{allQuestions.length} câu.
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Còn lại {unansweredQuestions.length} câu chưa trả lời.
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {showOnlyUnanswered
                ? `Đang hiển thị ${visibleQuestions.length} câu chưa làm.`
                : `Đang hiển thị toàn bộ ${allQuestions.length} câu.`}
            </Typography>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outlined"
                onClick={() =>
                  previousVisibleQuestion && handleJumpToQuestion(previousVisibleQuestion.id)
                }
                disabled={!previousVisibleQuestion || submitMutation.isPending}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Câu trước
              </Button>
              <Button
                variant="outlined"
                onClick={() => nextVisibleQuestion && handleJumpToQuestion(nextVisibleQuestion.id)}
                disabled={!nextVisibleQuestion || submitMutation.isPending}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Câu sau
              </Button>
            </div>

            <Button
              variant={showOnlyUnanswered ? "contained" : "outlined"}
              onClick={() => setShowOnlyUnanswered((prev) => !prev)}
              disabled={submitMutation.isPending}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              {showOnlyUnanswered ? "Hiện lại toàn bộ câu hỏi" : "Chỉ hiện câu chưa làm"}
            </Button>

            {firstUnansweredQuestion ? (
              <Button
                variant="outlined"
                onClick={() => handleJumpToQuestion(firstUnansweredQuestion.id)}
                disabled={submitMutation.isPending}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Đi tới câu chưa làm đầu tiên
              </Button>
            ) : null}

            <div className="grid grid-cols-5 gap-2">
              {visibleQuestions.map((question) => {
                const answered = Boolean(answers[question.id]);
                const active = activeQuestionId === question.id;

                return (
                  <button
                    key={`palette-${question.id}`}
                    type="button"
                    onClick={() => handleJumpToQuestion(question.id)}
                    disabled={submitMutation.isPending}
                    className={`rounded-lg border px-2 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      active
                        ? "border-blue-500 bg-blue-600 text-white"
                        : answered
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-fg)] hover:border-[var(--app-active-border)]"
                    }`}
                  >
                    {question.questionNumber}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-[var(--app-muted)]">
              <span>• Xanh đậm: đang xem</span>
              <span>• Xanh lá: đã trả lời</span>
              <span>• Viền thường: chưa trả lời</span>
            </div>

            {listeningAssets.length > 0 ? (
              <Alert severity="info">
                Tài liệu nghe khả dụng: {listeningAssets.length} file. Bản nâng cao sẽ map audio
                theo part.
              </Alert>
            ) : null}

            {saveMutation.isError ? (
              <Alert severity="warning">
                Không thể autosave đáp án. Nếu bài đã hết giờ hoặc phiên thi không còn hợp lệ, hệ
                thống sẽ chuyển bạn sang trang kết quả khi nộp bài.
              </Alert>
            ) : null}

            <Button
              variant="contained"
              disableElevation
              onClick={() => setSubmitDialogOpen(true)}
              disabled={!canSubmit}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "primary.main",
                color: "white",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                "&:disabled": {
                  bgcolor: "action.disabledBackground",
                  color: "action.disabled",
                },
              }}
            >
              {submitMutation.isPending ? "Đang nộp bài..." : "Nộp bài"}
            </Button>
          </Stack>
        </Paper>
      </div>

      <Dialog
        open={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Xác nhận nộp bài</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} className="pt-1">
            <Typography variant="body2">
              Bạn đã làm {answeredCount}/{allQuestions.length} câu.
            </Typography>
            <Typography variant="body2">
              Thời gian còn lại: <strong>{formatRemaining(remainingSeconds ?? 0)}</strong>
            </Typography>
            {unansweredQuestions.length > 0 ? (
              <Alert severity="warning">
                Vẫn còn {unansweredQuestions.length} câu chưa trả lời. Bạn vẫn có thể nộp bài ngay.
              </Alert>
            ) : (
              <Alert severity="success">Bạn đã trả lời toàn bộ câu hỏi.</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSubmitDialogOpen(false)} sx={{ textTransform: "none" }}>
            Quay lại làm bài
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitMutation.isPending}>
            {submitMutation.isPending ? "Đang nộp..." : "Xác nhận nộp"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
