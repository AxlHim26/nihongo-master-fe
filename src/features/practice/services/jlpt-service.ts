import type {
  ApiEnvelope,
  JlptAttemptResult,
  JlptAttemptSummary,
  JlptExamDetail,
  JlptExamListItem,
  JlptSaveAnswersResponse,
  JlptStartAttemptResponse,
  JlptSubmitAttemptResponse,
} from "@/features/practice/types/jlpt";
import { api } from "@/lib/api-client";

export const getJlptExams = async () => {
  const response = await api.get<ApiEnvelope<JlptExamListItem[]>>("/api/v1/jlpt/exams");
  return response.data.data;
};

export const getJlptExamDetail = async (examId: number) => {
  const response = await api.get<ApiEnvelope<JlptExamDetail>>(`/api/v1/jlpt/exams/${examId}`);
  return response.data.data;
};

export const startJlptAttempt = async (examId: number) => {
  const response = await api.post<ApiEnvelope<JlptStartAttemptResponse>>(
    `/api/v1/jlpt/exams/${examId}/attempts`,
  );
  return response.data.data;
};

export const saveJlptAnswers = async (
  attemptId: number,
  answers: Array<{ questionId: number; selectedOptionKey: string }>,
) => {
  const response = await api.patch<ApiEnvelope<JlptSaveAnswersResponse>>(
    `/api/v1/jlpt/attempts/${attemptId}/answers`,
    { answers },
  );
  return response.data.data;
};

export const submitJlptAttempt = async (attemptId: number) => {
  const response = await api.post<ApiEnvelope<JlptSubmitAttemptResponse>>(
    `/api/v1/jlpt/attempts/${attemptId}/submit`,
  );
  return response.data.data;
};

export const getJlptAttemptResult = async (attemptId: number) => {
  const response = await api.get<ApiEnvelope<JlptAttemptResult>>(
    `/api/v1/jlpt/attempts/${attemptId}/result`,
  );
  return response.data.data;
};

export const getJlptAttemptHistory = async () => {
  const response = await api.get<ApiEnvelope<JlptAttemptSummary[]>>(
    `/api/v1/jlpt/attempts/history`,
  );
  return response.data.data;
};
