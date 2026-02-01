import { NextResponse } from "next/server";

import { grammarLevels } from "@/core/data/grammar";

export const dynamic = "force-dynamic";

export async function GET() {
  const lessonCount = grammarLevels.reduce((sum, level) => sum + level.lessonCount, 0);
  const grammarCount = grammarLevels.reduce((sum, level) => sum + level.grammarCount, 0);

  return NextResponse.json({
    data: {
      levelCount: grammarLevels.length,
      lessonCount,
      grammarCount,
    },
  });
}
