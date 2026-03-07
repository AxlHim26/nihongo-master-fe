"use client";

import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  getJlptExamDetail,
  saveJlptAnswers,
  startJlptAttempt,
  submitJlptAttempt,
} from "@/features/practice/services/jlpt-service";

type PracticeJlptAttemptViewProps = {
  examId: number;
  attemptId: number;
};

type AnswersState = Record<number, string>;

const toSeconds = (minutes: number) => minutes * 60;

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

  const examQuery = useQuery({
    queryKey: ["jlpt", "exam", examId],
    queryFn: () => getJlptExamDetail(examId),
  });

  const startQuery = useQuery({
    queryKey: ["jlpt", "attempt", examId, attemptId],
    queryFn: () => startJlptAttempt(examId),
  });

  const [answers, setAnswers] = React.useState<AnswersState>({});
  const [remainingSeconds, setRemainingSeconds] = React.useState<number | null>(null);
  const [initializedAttemptId, setInitializedAttemptId] = React.useState<number | null>(null);

  React.useEffect(() => {
    const attempt = startQuery.data;
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
    setRemainingSeconds(toSeconds(exam.totalDurationMinutes));
    setInitializedAttemptId(attempt.attemptId);
  }, [examQuery.data, initializedAttemptId, startQuery.data]);

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

  React.useEffect(() => {
    if (!remainingSeconds || remainingSeconds > 0) {
      return;
    }
    if (!submitMutation.isPending) {
      submitMutation.mutate();
    }
  }, [remainingSeconds, submitMutation]);

  const startedAttemptId = startQuery.data?.attemptId;

  React.useEffect(() => {
    if (!startedAttemptId) {
      return;
    }

    if (startedAttemptId !== attemptId) {
      router.replace(`/practice/jlpt/tests/${examId}/attempt/${startedAttemptId}`);
    }
  }, [attemptId, examId, router, startedAttemptId]);

  React.useEffect(() => {
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
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  }, []);

  const handleSubmit = React.useCallback(() => {
    submitMutation.mutate();
  }, [submitMutation]);

  if (examQuery.isLoading || startQuery.isLoading || !examQuery.data || !startQuery.data) {
    return (
      <div className="flex items-center gap-2 text-[var(--app-muted)]">
        <CircularProgress size={18} />
        <Typography variant="body2">Đang tải bài thi...</Typography>
      </div>
    );
  }

  if (examQuery.isError || startQuery.isError) {
    return (
      <Alert severity="error">
        {(examQuery.error as Error)?.message ||
          (startQuery.error as Error)?.message ||
          "Không tải được bài thi."}
      </Alert>
    );
  }

  const attemptData = startQuery.data;

  if (attemptData.attemptId !== attemptId) {
    return (
      <div className="flex items-center gap-2 text-[var(--app-muted)]">
        <CircularProgress size={18} />
        <Typography variant="body2">Đang đồng bộ ca thi...</Typography>
      </div>
    );
  }

  const allQuestions = examQuery.data.sections.flatMap((section) => section.questions);
  const answeredCount = Object.keys(answers).length;
  const listeningAssets = examQuery.data.assets.filter(
    (asset) => asset.assetType === "LISTENING_SCRIPT" || asset.assetType === "QUESTION",
  );

  return (
    <Stack spacing={3} className="pb-6">
      <Typography variant="h4" fontWeight={700}>
        {examQuery.data.title}
      </Typography>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Stack spacing={2.5}>
          {examQuery.data.sections.map((section) => (
            <Paper
              key={section.id}
              elevation={0}
              className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 sm:p-5"
            >
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700}>
                  Part {section.sectionOrder}: {section.title}
                </Typography>

                {section.questions.map((question) => (
                  <div
                    key={question.id}
                    className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3"
                  >
                    <Typography variant="subtitle2" fontWeight={700}>
                      Câu {question.questionNumber}
                    </Typography>
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
                            className={`rounded-xl border px-3 py-2 text-left transition ${
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

            {listeningAssets.length > 0 ? (
              <Alert severity="info">
                Tài liệu nghe khả dụng: {listeningAssets.length} file. Bản nâng cao sẽ map audio
                theo part.
              </Alert>
            ) : null}

            {saveMutation.isError ? (
              <Alert severity="warning">Autosave gặp lỗi, vẫn có thể tiếp tục và nộp bài.</Alert>
            ) : null}

            <Button
              variant="contained"
              disableElevation
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
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
    </Stack>
  );
}
