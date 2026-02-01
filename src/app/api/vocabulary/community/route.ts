import { NextResponse } from "next/server";

import { vocabularySets } from "@/core/data/vocabulary";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ data: vocabularySets });
}
