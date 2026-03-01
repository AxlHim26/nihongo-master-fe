import type { Metadata } from "next";
import { notFound } from "next/navigation";

import KanjiGrid from "@/features/kanji/components/kanji-grid";

const VALID_LEVELS = ["n5", "n4", "n3", "n2", "n1"];

const LEVEL_METADATA: Record<string, { title: string; description: string }> = {
  n5: { title: "Hán tự N5", description: "Danh sách Hán tự JLPT N5 cơ bản nhất" },
  n4: { title: "Hán tự N4", description: "Danh sách Hán tự JLPT N4" },
  n3: { title: "Hán tự N3", description: "Danh sách Hán tự JLPT N3 trung cấp" },
  n2: { title: "Hán tự N2", description: "Danh sách Hán tự JLPT N2 nâng cao" },
  n1: { title: "Hán tự N1", description: "Danh sách Hán tự JLPT N1 cao cấp" },
};

type Props = {
  params: Promise<{ level: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level } = await params;
  const meta = LEVEL_METADATA[level];
  if (!meta) return { title: "Hán tự" };
  return { title: meta.title, description: meta.description };
}

export function generateStaticParams() {
  return VALID_LEVELS.map((level) => ({ level }));
}

export default async function KanjiLevelPage({ params }: Props) {
  const { level } = await params;

  if (!VALID_LEVELS.includes(level)) {
    notFound();
  }

  return <KanjiGrid level={level} />;
}
