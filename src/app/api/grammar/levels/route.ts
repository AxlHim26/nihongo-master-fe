import { NextResponse } from "next/server";

import { grammarLevels } from "@/core/data/grammar";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ data: grammarLevels });
}
