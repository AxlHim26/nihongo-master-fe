import fs from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type KanjiSummary = {
  kanji: string;
  meaning: Record<string, string> | string;
  onyomi: string;
  kunyomi: string;
  jlptLevel: string;
  strokeCount: number;
  index: number;
  amHanViet?: string;
  hanViet?: string[] | null;
  hanVietExplain?: Record<string, string>;
};

const VALID_LEVELS = ["1", "2", "3", "4", "5"];

// Use a global variable to persist cache across HMR in dev if possible,
// or at least across requests in the same process.
const globalCache = global as unknown as {
  kanjiJlptCache?: Map<string, KanjiSummary[]>;
  kanjiJlptLoading?: Promise<void>;
};

if (!globalCache.kanjiJlptCache) {
  globalCache.kanjiJlptCache = new Map();
}

async function loadAllKanji(kanjiDir: string) {
  if (globalCache.kanjiJlptLoading) return globalCache.kanjiJlptLoading;

  globalCache.kanjiJlptLoading = (async () => {
    console.log("[KanjiAPI] Starting to index kanji by JLPT level...");
    const start = Date.now();

    // Load local mock data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let localKanjiData: Record<string, any> = {};
    try {
      const localDataPath = path.join(process.cwd(), "data", "kanji_data.json");
      const localDataRaw = await fs.readFile(localDataPath, "utf-8");
      localKanjiData = JSON.parse(localDataRaw);
    } catch (e) {
      console.warn("[KanjiAPI] Could not load data/kanji_data.json", e);
    }

    const files = await fs.readdir(kanjiDir);
    const jsonFiles = files.filter(
      (f) => f.endsWith(".json") && f !== "default.json" && !f.startsWith("CDP-"),
    );

    const levels: Record<string, KanjiSummary[]> = {
      N1: [],
      N2: [],
      N3: [],
      N4: [],
      N5: [],
    };

    // Process in batches of 100 to avoid "too many open files"
    const batchSize = 100;
    for (let i = 0; i < jsonFiles.length; i += batchSize) {
      const batch = jsonFiles.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (file) => {
          try {
            const raw = await fs.readFile(path.join(kanjiDir, file), "utf-8");
            const data = JSON.parse(raw);
            const jlpt = data.jishoData?.jlptLevel;

            if (!jlpt || !levels[jlpt]) return;

            const kanji = data.id ?? file.replace(/\.json$/, "");

            // Merge with localKanjiData
            const localInfo = localKanjiData[kanji];
            const amHanViet = localInfo?.hanviet ?? data.amHanViet ?? "";
            const hanViet = data.hanViet ?? null;
            const hanVietExplain = data.hanVietExplain ?? null;
            const meaning =
              data.meaning ??
              localInfo?.nghia ??
              data.kanjialiveData?.meaning ??
              data.jishoData?.meaning ??
              "";

            const onyomi =
              data.kanjialiveData?.onyomi_ja || (data.jishoData?.onyomi ?? []).join("、") || "";
            const kunyomi =
              data.kanjialiveData?.kunyomi_ja || (data.jishoData?.kunyomi ?? []).join("、") || "";
            const strokeCount = data.jishoData?.strokeCount ?? 0;

            levels[jlpt].push({
              kanji,
              meaning,
              onyomi,
              kunyomi,
              jlptLevel: jlpt,
              strokeCount,
              index: 0,
              amHanViet,
              hanViet,
              hanVietExplain,
            });
          } catch {
            // skip invalid files
          }
        }),
      );
    }

    // Sort and cache
    for (const [lvl, items] of Object.entries(levels)) {
      items.sort((a, b) => a.strokeCount - b.strokeCount || a.kanji.localeCompare(b.kanji, "ja"));
      items.forEach((item, i) => {
        item.index = i + 1;
      });
      globalCache.kanjiJlptCache!.set(lvl.replace("N", ""), items);
    }

    console.log(`[KanjiAPI] Indexed ${jsonFiles.length} files in ${Date.now() - start}ms`);
  })();

  return globalCache.kanjiJlptLoading;
}

export async function GET(request: NextRequest, context: { params: Promise<{ level: string }> }) {
  const params = await context.params;
  const level = params.level;

  if (!VALID_LEVELS.includes(level)) {
    return NextResponse.json(
      { error: "Invalid JLPT level", detail: `Level must be one of: ${VALID_LEVELS.join(", ")}` },
      { status: 400 },
    );
  }

  let kanjiDir = process.env["KANJI_DATA_DIR"];
  if (!kanjiDir) {
    // Attempt fallback to local data dir
    kanjiDir = path.join(process.cwd(), "data", "kanji");
  }

  try {
    // Ensure all kanji are indexed (cached)
    await loadAllKanji(kanjiDir);

    const allKanji = globalCache.kanjiJlptCache!.get(level) || [];

    const page = Math.max(1, Number(request.nextUrl.searchParams.get("page")) || 1);
    const size = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("size")) || 20));
    const start = (page - 1) * size;
    const items = allKanji.slice(start, start + size);

    return NextResponse.json({
      items,
      total: allKanji.length,
      page,
      size,
      totalPages: Math.ceil(allKanji.length / size),
    });
  } catch (error) {
    console.error("[KanjiAPI] Error loading level data:", error);
    return NextResponse.json(
      { error: "Failed to load kanji data", detail: String(error) },
      { status: 500 },
    );
  }
}
