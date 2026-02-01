import fs from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const kanji = decodeURIComponent(params.id);
  const filePath = path.join(process.cwd(), "data", "kanji", `${kanji}.json`);

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(raw);
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: "Kanji not found", detail: String(error) }, { status: 404 });
  }
}
