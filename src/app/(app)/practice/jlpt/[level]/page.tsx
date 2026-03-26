import { Metadata } from "next";
import JlptLevelView from "@/features/practice/components/jlpt-level-view";

export const metadata: Metadata = {
  title: "Luyện thi JLPT - Chọn kỹ năng",
  description: "Chọn kỹ năng luyện thi JLPT",
};

export default async function JlptLevelPage(props: { params: Promise<{ level: string }> }) {
  const params = await props.params;
  return <JlptLevelView level={params.level.toUpperCase()} />;
}
