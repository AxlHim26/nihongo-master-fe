import type { Metadata } from "next";

import KanjiMapView from "@/features/kanji/components/kanji-map-view";

export const metadata: Metadata = {
  title: "Kanji map",
  description: "Bản đồ tiến độ học kanji theo cấp độ JLPT",
};

export default function KanjiMapPage() {
  return <KanjiMapView />;
}
