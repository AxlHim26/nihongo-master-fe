import type { KanjiCluster } from "@/features/kanji/types/kanji";

export const kanjiClusters: KanjiCluster[] = [
  {
    id: "n5-foundation",
    title: "Kanji nền tảng N5",
    description: "Hệ thống 80 chữ nền tảng cho hội thoại cơ bản",
    level: "N5",
    kanjiCount: 80,
    progress: 35,
  },
  {
    id: "n4-core",
    title: "Kanji trọng tâm N4",
    description: "Bổ sung chữ ghép, tăng tốc phản xạ đọc",
    level: "N4",
    kanjiCount: 170,
    progress: 20,
  },
  {
    id: "n3-bridge",
    title: "Kanji tăng tốc N3",
    description: "Phân cụm theo chủ đề và sắc thái nghĩa",
    level: "N3",
    kanjiCount: 250,
    progress: 12,
  },
  {
    id: "n2-master",
    title: "Kanji học thuật N2",
    description: "Chiến lược ghi nhớ, đọc hiểu tài liệu",
    level: "N2",
    kanjiCount: 370,
    progress: 4,
  },
];
