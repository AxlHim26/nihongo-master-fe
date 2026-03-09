"use client";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { getJlptAttemptResult } from "@/features/practice/services/jlpt-service";

type PracticeJlptResultViewProps = {
  attemptId: number;
};

export default function PracticeJlptResultView({ attemptId }: PracticeJlptResultViewProps) {
  const router = useRouter();

  const resultQuery = useQuery({
    queryKey: ["jlpt", "result", attemptId],
    queryFn: () => getJlptAttemptResult(attemptId),
  });

  if (resultQuery.isError) {
    return (
      <Alert severity="error">
        Không tải được kết quả. Có thể bài thi chưa được nộp hoặc phiên làm bài không còn hợp lệ.
      </Alert>
    );
  }

  if (resultQuery.isLoading || !resultQuery.data) {
    return (
      <div className="flex items-center gap-2 text-[var(--app-muted)]">
        <CircularProgress size={18} />
        <Typography variant="body2">Đang tải kết quả...</Typography>
      </div>
    );
  }

  const result = resultQuery.data;

  return (
    <Stack spacing={3} className="pb-6">
      <Typography variant="h4" fontWeight={700}>
        Kết quả JLPT: {result.examCode}
      </Typography>

      <Paper
        elevation={0}
        className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 sm:p-5"
      >
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            {result.examTitle}
          </Typography>

          <Alert
            icon={result.passed ? <CheckCircleRoundedIcon /> : <HighlightOffRoundedIcon />}
            severity={result.passed ? "success" : "warning"}
          >
            Tổng điểm: <strong>{result.totalScaledScore}</strong> ·{" "}
            {result.passed ? "Đạt" : "Chưa đạt"}
          </Alert>

          <div className="grid gap-2 sm:grid-cols-3">
            {result.sections.map((section) => (
              <div
                key={section.sectionId}
                className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3"
              >
                <Typography variant="caption" color="text.secondary">
                  {section.title}
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  {section.scaledScore}/{section.scaledMaxScore}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {section.rawScore}/{section.rawMaxScore} câu
                </Typography>
              </div>
            ))}
          </div>

          <Button
            variant="contained"
            disableElevation
            sx={{
              textTransform: "none",
              fontWeight: 700,
              width: "fit-content",
              bgcolor: "primary.main",
              color: "white",
              "&:hover": {
                bgcolor: "primary.dark",
              },
            }}
            onClick={() => router.push("/practice/jlpt")}
          >
            Quay lại danh sách đề
          </Button>
        </Stack>
      </Paper>

      <Stack spacing={2}>
        {result.sections.map((section) => (
          <Paper
            key={`review-${section.sectionId}`}
            elevation={0}
            className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 sm:p-5"
          >
            <Stack spacing={1.5}>
              <Typography variant="h6" fontWeight={700}>
                {section.title}
              </Typography>
              {section.questions.map((question) => (
                <div
                  key={question.questionId}
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
                      const isCorrect = option.key === question.correctOptionKey;
                      const isSelected = option.key === question.selectedOptionKey;
                      const isWrongSelection = isSelected && !isCorrect;

                      let className = "rounded-xl border px-3 py-2 text-left cursor-default ";
                      if (isCorrect) {
                        className +=
                          "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-950/30 dark:text-emerald-200";
                      } else if (isWrongSelection) {
                        className +=
                          "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700/50 dark:bg-rose-950/30 dark:text-rose-200";
                      } else {
                        className +=
                          "border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-fg)]";
                      }

                      return (
                        <div key={`${question.questionId}-${option.key}`} className={className}>
                          <span className="mr-2 font-semibold">{option.key}.</span>
                          {option.text}
                          {isCorrect && (
                            <span className="ml-2 text-xs font-semibold">(Đáp án đúng)</span>
                          )}
                          {isWrongSelection && (
                            <span className="ml-2 text-xs font-semibold">(Bạn chọn)</span>
                          )}
                        </div>
                      );
                    })}
                    {question.selectedOptionKey === null && (
                      <Typography variant="caption" className="text-[var(--app-muted)]">
                        (Chưa trả lời)
                      </Typography>
                    )}
                  </div>
                </div>
              ))}
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}
