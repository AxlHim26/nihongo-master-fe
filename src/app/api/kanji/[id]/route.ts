import fs from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const kanji = decodeURIComponent(params.id);
  let kanjiDir = process.env["KANJI_DATA_DIR"];

  if (!kanjiDir) {
    // Attempt fallback to local data dir
    kanjiDir = path.join(process.cwd(), "data", "kanji");
  }

  const filePath = path.resolve(kanjiDir, `${kanji}.json`);

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(raw);

    // Merge with local mock data if available
    try {
      const localDataPath = path.join(process.cwd(), "data", "kanji_data.json");
      const localDataRaw = await fs.readFile(localDataPath, "utf-8");
      const localKanjiData = JSON.parse(localDataRaw);

      const localInfo = localKanjiData[kanji];
      if (localInfo) {
        json.amHanViet = localInfo.hanviet;
        if (!json.kanjialiveData) json.kanjialiveData = {};
        json.kanjialiveData.meaning = localInfo.nghia;
        json.kanjialiveData.mn_hint = localInfo.meonho;
      }
    } catch (e) {
      console.warn("[KanjiDetailAPI] Could not load data/kanji_data.json", e);
    }

    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: "Kanji not found", detail: String(error) }, { status: 404 });
  }
}
