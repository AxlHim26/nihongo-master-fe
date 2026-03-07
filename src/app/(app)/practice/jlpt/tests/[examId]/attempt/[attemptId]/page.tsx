import type { Metadata } from "next";

import PracticeJlptAttemptView from "@/features/practice/components/practice-jlpt-attempt-view";

type PracticeJlptAttemptPageProps = {
  params: Promise<{
    examId: string;
    attemptId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Thi thử JLPT",
  description: "Làm đề thi thử JLPT có lưu tiến trình",
};

export default async function PracticeJlptAttemptPage({ params }: PracticeJlptAttemptPageProps) {
  const { examId, attemptId } = await params;

  return <PracticeJlptAttemptView examId={Number(examId)} attemptId={Number(attemptId)} />;
}
