export type Course = {
  id: string;
  title: string;
  description: string;
  lessonCount: number;
  duration: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  badge?: string;
};
