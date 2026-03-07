import type { Metadata } from "next";

import PracticeJlptResultView from "@/features/practice/components/practice-jlpt-result-view";

type PracticeJlptResultPageProps = {
  params: Promise<{
    attemptId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Kết quả JLPT",
  description: "Xem điểm và đáp án thi thử JLPT",
};

export default async function PracticeJlptResultPage({ params }: PracticeJlptResultPageProps) {
  const { attemptId } = await params;

  return <PracticeJlptResultView attemptId={Number(attemptId)} />;
}
