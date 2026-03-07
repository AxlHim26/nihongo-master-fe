"use client";

import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  getJlptAttemptHistory,
  getJlptExams,
  startJlptAttempt,
} from "@/features/practice/services/jlpt-service";

const formatExamSchedule = (year: number, month: number) =>
  `${String(month).padStart(2, "0")}/${year}`;

const LEVELS = ["N1", "N2", "N3", "N4", "N5"] as const;

export default function PracticeJlptView() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const examsQuery = useQuery({
    queryKey: ["jlpt", "exams"],
    queryFn: getJlptExams,
  });

  const historyQuery = useQuery({
    queryKey: ["jlpt", "history"],
    queryFn: getJlptAttemptHistory,
  });

  const startMutation = useMutation({
    mutationFn: (examId: number) => startJlptAttempt(examId),
    onSuccess: (attempt) => {
      router.push(`/practice/jlpt/tests/${attempt.examId}/attempt/${attempt.attemptId}`);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["jlpt", "history"] });
    },
  });

  const isLoading = examsQuery.isLoading || historyQuery.isLoading;

  const examsByLevel = React.useMemo(() => {
    const grouped = new Map<string, typeof examsQuery.data>();
    if (!examsQuery.data) return grouped;

    for (const level of LEVELS) {
      grouped.set(level, []);
    }

    for (const exam of examsQuery.data) {
      const levelExams = grouped.get(exam.level);
      if (levelExams) {
        levelExams.push(exam);
      }
    }

    return grouped;
  }, [examsQuery.data]);

  return (
    <Stack spacing={3} className="pb-6">
      <Typography variant="h4" fontWeight={700}>
        Luyện thi JLPT
      </Typography>

      <Paper
        elevation={0}
        className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 sm:p-5"
      >
        <Stack spacing={1.5}>
          <Typography variant="h6" fontWeight={700}>
            Kế hoạch mô phỏng thi thật
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Đề được dựng từ kỳ thi gần đây, có timer theo section, autosave đáp án và chấm điểm theo
            thang chuẩn hóa 60 điểm mỗi phần.
          </Typography>
        </Stack>
      </Paper>

      {isLoading ? (
        <div className="flex items-center gap-2 text-[var(--app-muted)]">
          <CircularProgress size={18} />
          <Typography variant="body2">Đang tải dữ liệu JLPT...</Typography>
        </div>
      ) : null}

      {examsQuery.isError ? (
        <Alert severity="error">
          {examsQuery.error instanceof Error
            ? examsQuery.error.message
            : "Không tải được danh sách đề."}
        </Alert>
      ) : null}

      {historyQuery.isError ? (
        <Alert severity="error">
          {historyQuery.error instanceof Error
            ? historyQuery.error.message
            : "Không tải được lịch sử thi thử."}
        </Alert>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Stack spacing={2.5}>
          {LEVELS.map((level) => {
            const exams = examsByLevel.get(level) ?? [];
            if (exams.length === 0) return null;

            return (
              <Accordion
                key={level}
                defaultExpanded
                disableGutters
                elevation={0}
                className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)]"
                sx={{
                  "&:before": { display: "none" },
                  "&.Mui-expanded": { margin: 0 },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  className="px-4 sm:px-5"
                  sx={{
                    minHeight: "56px",
                    "&.Mui-expanded": { minHeight: "56px" },
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Chip label={level} color="primary" size="small" sx={{ fontWeight: 700 }} />
                    <Typography variant="h6" fontWeight={700}>
                      {exams.length} đề thi
                    </Typography>
                  </div>
                </AccordionSummary>
                <AccordionDetails className="px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
                  <Stack spacing={2}>
                    {exams.map((exam) => (
                      <Paper
                        key={exam.id}
                        elevation={0}
                        className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4"
                      >
                        <Stack spacing={2}>
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <Typography variant="subtitle1" fontWeight={700}>
                                {exam.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {exam.code} · {formatExamSchedule(exam.examYear, exam.examMonth)}
                              </Typography>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[var(--app-muted)]">
                            <Chip
                              size="small"
                              variant="outlined"
                              icon={<AccessTimeRoundedIcon fontSize="small" />}
                              label={`${exam.totalDurationMinutes} phút`}
                            />
                            <Chip
                              size="small"
                              variant="outlined"
                              icon={<FactCheckRoundedIcon fontSize="small" />}
                              label="Autosave đáp án"
                            />
                            <Chip
                              size="small"
                              variant="outlined"
                              icon={<EmojiEventsRoundedIcon fontSize="small" />}
                              label="Chấm điểm chuẩn hóa"
                            />
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="contained"
                              disableElevation
                              onClick={() => startMutation.mutate(exam.id)}
                              disabled={startMutation.isPending}
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
                              {startMutation.isPending ? "Đang tạo ca thi..." : "Vào thi thử"}
                            </Button>
                          </div>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>

        <Paper
          elevation={0}
          className="h-fit rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 sm:p-5 xl:sticky xl:top-5"
        >
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={700}>
              Lịch sử gần đây
            </Typography>

            <Divider />

            {(historyQuery.data ?? []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Bạn chưa có lượt thi nào.
              </Typography>
            ) : (
              (historyQuery.data ?? []).slice(0, 8).map((item) => (
                <button
                  key={item.attemptId}
                  type="button"
                  onClick={() =>
                    item.status === "SUBMITTED"
                      ? router.push(`/practice/jlpt/attempts/${item.attemptId}/result`)
                      : router.push(`/practice/jlpt/tests/${item.examId}/attempt/${item.attemptId}`)
                  }
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-left transition hover:border-[var(--app-active-border)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Typography variant="body2" fontWeight={700}>
                      {item.examCode}
                    </Typography>
                    <Chip
                      size="small"
                      color={item.status === "SUBMITTED" ? "success" : "warning"}
                      label={item.status === "SUBMITTED" ? "Đã nộp" : "Đang làm"}
                    />
                  </div>
                  <Typography variant="caption" color="text.secondary" className="mt-0.5 block">
                    {item.examTitle}
                  </Typography>
                  {item.status === "SUBMITTED" ? (
                    <Typography variant="caption" className="mt-1 block text-[var(--app-fg)]">
                      Điểm: {item.totalScaledScore ?? 0} · {item.passed ? "Đạt" : "Chưa đạt"}
                    </Typography>
                  ) : (
                    <Typography variant="caption" className="mt-1 block text-[var(--app-muted)]">
                      <ReplayRoundedIcon fontSize="inherit" className="mr-1" />
                      Tiếp tục bài thi
                    </Typography>
                  )}
                </button>
              ))
            )}
          </Stack>
        </Paper>
      </div>
    </Stack>
  );
}
