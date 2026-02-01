export type KanjiCluster = {
  id: string;
  title: string;
  description: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  kanjiCount: number;
  progress: number;
};
