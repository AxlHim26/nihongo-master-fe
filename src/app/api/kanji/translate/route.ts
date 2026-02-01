import { NextResponse } from "next/server";

const MEGALLM_API_KEY = process.env["MEGALLM_API_KEY"];
const MEGALLM_BASE_URL = process.env["MEGALLM_BASE_URL"] || "https://api.megallm.ai";
const MEGALLM_MODEL = process.env["MEGALLM_MODEL"] || "gpt-4o-mini";

export async function POST(request: Request) {
  if (!MEGALLM_API_KEY) {
    return NextResponse.json({ error: "Missing MEGALLM_API_KEY" }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as { texts?: string[] } | null;
  const texts = body?.texts?.filter((text) => typeof text === "string" && text.trim()) ?? [];
  if (texts.length === 0) {
    return NextResponse.json({ translations: [] });
  }

  const prompt = [
    "Bạn là dịch giả. Dịch các cụm tiếng Anh/Japanese ngắn sau sang tiếng Việt tự nhiên.",
    "Trả về đúng JSON array các chuỗi tiếng Việt theo đúng thứ tự.",
    "Không thêm chú thích, không thêm ký tự thừa.",
    "Danh sách:",
    ...texts.map((text, index) => `${index + 1}. ${text}`),
  ].join("\n");

  const response = await fetch(`${MEGALLM_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MEGALLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: MEGALLM_MODEL,
      messages: [
        {
          role: "system",
          content: "Bạn chỉ trả về JSON array. Không được giải thích thêm.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json({ error: "Translation failed", detail: errorText }, { status: 500 });
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content ?? "";

  try {
    const parsed = JSON.parse(content) as string[];
    return NextResponse.json({ translations: parsed });
  } catch {
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as string[];
        return NextResponse.json({ translations: parsed });
      } catch {
        return NextResponse.json({ translations: [] });
      }
    }
    return NextResponse.json({ translations: [] });
  }
}
