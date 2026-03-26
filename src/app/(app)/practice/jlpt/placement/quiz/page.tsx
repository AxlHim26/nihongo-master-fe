import { Metadata } from "next";
import JlptPracticeView from "@/features/practice/components/jlpt-practice-view";

export const metadata: Metadata = {
  title: "Xếp lớp JLPT",
  description: "Bài kiểm tra xếp lớp JLPT",
};

export default function PlacementQuizPage() {
  // Reuse the practice view with a special "PLACEMENT" level/type
  return <JlptPracticeView level="PLACEMENT" type="ASSESSMENT" />;
}
