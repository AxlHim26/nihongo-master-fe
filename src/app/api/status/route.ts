import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env["MEGALLM_API_KEY"]) {
    return NextResponse.json(
      {
        error: "MEGALLM_API_KEY is missing.",
      },
      { status: 500 },
    );
  }
  return NextResponse.json({
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      llmProvider: process.env["MEGALLM_API_KEY"] ? "megallm" : "local",
    },
  });
}
