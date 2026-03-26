import { Metadata } from "next";
import JlptPracticeView from "@/features/practice/components/jlpt-practice-view";

export const metadata: Metadata = {
  title: "Luyện thi JLPT - Practice Mode",
  description: "Luyện thi JLPT Mini-set",
};

export default async function JlptPracticePage(
  props: { 
    params: Promise<{ level: string }>,
    searchParams: Promise<{ type?: string }>
  }
) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  return <JlptPracticeView level={params.level.toUpperCase()} type={searchParams.type || "LANGUAGE_KNOWLEDGE"} />;
}
