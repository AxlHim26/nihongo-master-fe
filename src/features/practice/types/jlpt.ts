export type { ApiEnvelope } from "@/lib/api-client";

export type JlptSectionType =
  | "LANGUAGE_KNOWLEDGE"
  | "READING"
  | "LISTENING"
  | "VOCABULARY"
  | "GRAMMAR_READING"
  | "GRAMMAR_KNOWLEDGE"
  | "READING_COMPREHENSION";

export type JlptAttemptStatus = "IN_PROGRESS" | "SUBMITTED";

export type JlptExamListItem = {
  id: number;
  code: string;
  title: string;
  level: string;
  examYear: number;
  examMonth: number;
  totalDurationMinutes: number;
};

export type JlptQuestionOption = {
  key: string;
  text: string;
};

export type JlptQuestion = {
  id: number;
  partNumber: number | null;
  questionNumber: number;
  prompt: string;
  options: JlptQuestionOption[];
};

export type JlptSection = {
  id: number;
  sectionType: JlptSectionType;
  title: string;
  sectionOrder: number;
  durationMinutes: number;
  questions: JlptQuestion[];
};

export type JlptExamDetail = {
  id: number;
  code: string;
  title: string;
  level: string;
  examYear: number;
  examMonth: number;
  totalDurationMinutes: number;
  assets: JlptExamAsset[];
  sections: JlptSection[];
};

export type JlptExamAsset = {
  id: number;
  assetType: string;
  sourcePath: string;
  extractedTextPath: string | null;
  quality: string | null;
};

export type JlptAttemptAnswer = {
  questionId: number;
  selectedOptionKey: string | null;
};

export type JlptStartAttemptResponse = {
  attemptId: number;
  examId: number;
  status: JlptAttemptStatus;
  startedAt: string;
  totalDurationMinutes: number;
  remainingSeconds: number;
  answers: JlptAttemptAnswer[];
};

export type JlptSaveAnswersResponse = {
  attemptId: number;
  savedCount: number;
};

export type JlptSubmitAttemptResponse = {
  attemptId: number;
  status: JlptAttemptStatus;
  totalScaledScore: number;
  passed: boolean;
};

export type JlptAttemptSummary = {
  attemptId: number;
  examId: number;
  examCode: string;
  examTitle: string;
  level: string;
  status: JlptAttemptStatus;
  totalScaledScore: number | null;
  passed: boolean | null;
  startedAt: string;
  submittedAt: string | null;
};

export type JlptAttemptResultQuestion = {
  questionId: number;
  questionNumber: number;
  prompt: string;
  selectedOptionKey: string | null;
  correctOptionKey: string;
  correct: boolean;
  options: JlptQuestionOption[];
};

export type JlptAttemptSectionResult = {
  sectionId: number;
  sectionType: JlptSectionType;
  title: string;
  rawScore: number;
  rawMaxScore: number;
  scaledScore: number;
  scaledMaxScore: number;
  questions: JlptAttemptResultQuestion[];
};

export type JlptAttemptResult = {
  attemptId: number;
  examId: number;
  examCode: string;
  examTitle: string;
  level: string;
  totalScaledScore: number;
  passed: boolean;
  sections: JlptAttemptSectionResult[];
};
