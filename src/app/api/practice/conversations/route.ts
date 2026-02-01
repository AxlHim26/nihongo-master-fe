import { NextResponse } from "next/server";

import { conversations } from "@/core/data/practice";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ data: conversations });
}
