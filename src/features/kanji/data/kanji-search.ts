import searchlist from "@/features/kanji/data/searchlist.json";

export type KanjiGroup = "joyo" | "jinmeiyo" | "other";

export type KanjiSearchEntry = {
  kanji: string;
  reading: string;
  meaning: string;
  group: KanjiGroup;
};

const GROUP_MAP: Record<number, KanjiGroup> = {
  1: "joyo",
  2: "jinmeiyo",
  3: "other",
};

export const kanjiSearchOptions: KanjiSearchEntry[] = searchlist
  .map((entry) => ({
    kanji: entry.k,
    reading: entry.r,
    meaning: entry.m,
    group: GROUP_MAP[entry.g] ?? "other",
  }))
  .filter((entry) => entry.kanji && entry.kanji.length <= 2)
  .filter((entry) => entry.meaning || entry.reading);

export const kanjiSearchSet = new Set(kanjiSearchOptions.map((entry) => entry.kanji));

export const kanjiGroupLabel: Record<KanjiGroup, string> = {
  joyo: "Jōyō",
  jinmeiyo: "Jinmeiyō",
  other: "Khác",
};
