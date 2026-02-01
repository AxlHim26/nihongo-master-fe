import { NextResponse } from "next/server";

import { grammarPoints } from "@/core/data/grammar";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const levelId = searchParams.get("levelId");

  const filtered = levelId
    ? grammarPoints.filter((point) => point.levelId === levelId)
    : grammarPoints;

  return NextResponse.json({ data: filtered });
}
