import { NextResponse } from "next/server";

import { buildMegaLlmChatCompletionsUrl } from "@/lib/megallm";

const MEGALLM_API_KEY = process.env["MEGALLM_API_KEY"];
const MEGALLM_COMPLETIONS_URL = buildMegaLlmChatCompletionsUrl(process.env["MEGALLM_BASE_URL"]);
const MEGALLM_MODEL = process.env["MEGALLM_MODEL"] || "openai-gpt-oss-20b";

const readContent = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return "";
  }
  const choices = (payload as { choices?: Array<{ message?: { content?: string } }> }).choices;
  return choices?.[0]?.message?.content?.trim() ?? "";
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { text?: string } | null;
  const text = body?.text?.trim() ?? "";

  if (!text) {
    return NextResponse.json({ text: "" });
  }

  if (!MEGALLM_API_KEY) {
    return NextResponse.json({ text });
  }

  const prompt = [
    "Rewrite the Japanese sentence with furigana for every kanji word.",
    "Rules:",
    "- Keep meaning and punctuation unchanged.",
    "- Output only one plain text line.",
    "- For each kanji word, use exact format: 漢字(かんじ).",
    "- Kana-only words must stay as-is.",
    `Input: ${text}`,
  ].join("\n");

  try {
    const response = await fetch(MEGALLM_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MEGALLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: MEGALLM_MODEL,
        temperature: 0.1,
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content:
              "You output only transformed Japanese text. Never output JSON or markdown. Never output extra commentary.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ text });
    }

    const payload = (await response.json().catch(() => null)) as unknown;
    const converted = readContent(payload) || text;
    return NextResponse.json({ text: converted });
  } catch {
    return NextResponse.json({ text });
  }
}
