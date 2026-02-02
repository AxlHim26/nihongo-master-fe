import fs from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const kanji = decodeURIComponent(params.id);
  const kanjiDir = process.env["KANJI_DATA_DIR"];

  if (!kanjiDir) {
    return NextResponse.json(
      { error: "Kanji data directory is not configured", detail: "KANJI_DATA_DIR is missing" },
      { status: 500 },
    );
  }

  const filePath = path.resolve(kanjiDir, `${kanji}.json`);

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(raw);
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: "Kanji not found", detail: String(error) }, { status: 404 });
  }
}
