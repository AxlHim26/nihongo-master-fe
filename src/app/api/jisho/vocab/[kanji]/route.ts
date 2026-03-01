import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, context: { params: Promise<{ kanji: string }> }) {
  const params = await context.params;
  const kanji = decodeURIComponent(params.kanji);

  try {
    const response = await fetch(
      `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(kanji)}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 86400 }, // Cache on Next.js side for 24h
      },
    );

    if (!response.ok) {
      throw new Error(`Jisho API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Process and extract top 5 vocabularies
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items =
      data.data?.slice(0, 5).map((item: any) => {
        // Find the japanese text that contains the kanji, or just use the first one
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const japanese =
          item.japanese?.find((j: any) => j.word?.includes(kanji)) || item.japanese?.[0];

        const word = japanese?.word || japanese?.reading || "";
        const reading = japanese?.reading || "";
        const meaning = item.senses?.[0]?.english_definitions?.join(", ") || "";

        return { word, reading, meaning };
      }) || [];

    return NextResponse.json({ items });
  } catch (error) {
    console.error("[JishoAPI] Error fetching vocabulary:", error);
    return NextResponse.json(
      { error: "Failed to fetch vocabulary", detail: String(error) },
      { status: 500 },
    );
  }
}
