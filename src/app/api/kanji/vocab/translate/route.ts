import fs from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { buildMegaLlmChatCompletionsUrl } from "@/lib/megallm";

const MEGALLM_API_KEY = process.env["MEGALLM_API_KEY"];
const MEGALLM_COMPLETIONS_URL = buildMegaLlmChatCompletionsUrl(process.env["MEGALLM_BASE_URL"]);
const MEGALLM_MODEL = process.env["MEGALLM_MODEL"] || "gpt-4o-mini";
const KANJI_DIR = process.env["KANJI_DATA_DIR"] || path.join(process.cwd(), "data", "kanji");

async function translateTexts(texts: string[]) {
  if (!texts.length) return [];
  if (!MEGALLM_API_KEY) throw new Error("Missing MEGALLM_API_KEY");

  const prompt = [
    "Bạn là dịch giả. Dịch các cụm tiếng Anh hoặc Nhật này sang tiếng Việt tự nhiên và sát nghĩa nhất.",
    "Lưu ý: Chỉ trả về mảng JSON chứa các chuỗi tiếng Việt đã dịch, giữ nguyên thứ tự. TUYỆT ĐỐI không được thêm ngoặc kép thừa, markdown, hay các dòng giải thích.",
    "Ví dụ: Nếu nhận ['mouth', 'population'], trả về ['miệng', 'dân số'].",
    "Danh sách cần dịch:",
    ...texts.map((text, index) => `${index + 1}. ${text}`),
  ].join("\n");

  const response = await fetch(MEGALLM_COMPLETIONS_URL, {
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
          content: "Chỉ trả về JSON array hợp lệ. Trả lời nghiêm ngặt.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MegaLLM translation failed: ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content ?? "";

  try {
    return JSON.parse(content) as string[];
  } catch {
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]) as string[];
      } catch {
        return [];
      }
    }
    return [];
  }
}

export async function POST(request: Request) {
  if (!MEGALLM_API_KEY) {
    return NextResponse.json({ error: "Missing MEGALLM_API_KEY" }, { status: 500 });
  }

  try {
    const { kanji } = (await request.json()) as { kanji?: string };
    if (!kanji) {
      return NextResponse.json({ error: "Missing kanji parameter" }, { status: 400 });
    }

    const filePath = path.join(KANJI_DIR, `${kanji}.json`);
    const rawData = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(rawData);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const textsToTranslate: { ref: any; langKey: string; extFallback: string }[] = [];

    // Helper to find untranslated terms into the queue array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queueTranslations = (examples: any[]) => {
      if (!Array.isArray(examples)) return;
      examples.forEach((ex) => {
        if (!ex.meaning) return;

        // Handling Jisho examples format: { en: "mouth", vi: null } OR string "mouth"
        if (typeof ex.meaning === "string") {
          // It's a string, we need to convert it and we want to translate it
          textsToTranslate.push({ ref: ex, langKey: "meaning", extFallback: ex.meaning });
        } else if (typeof ex.meaning === "object") {
          if (!ex.meaning.vi && !ex.meaning.vietnamese && (ex.meaning.en || ex.meaning.english)) {
            textsToTranslate.push({
              ref: ex.meaning,
              langKey: "vi",
              extFallback: ex.meaning.en || ex.meaning.english,
            });
          }
        }
      });
    };

    if (data.jishoData) {
      queueTranslations(data.jishoData.kunyomiExamples);
      queueTranslations(data.jishoData.onyomiExamples);
    }
    if (data.kanjialiveData?.examples) {
      queueTranslations(data.kanjialiveData.examples);
    }

    if (textsToTranslate.length === 0) {
      return NextResponse.json({ message: "No translations needed", data });
    }

    const stringsToSend = textsToTranslate.map((t) => t.extFallback);
    const translatedStrings = await translateTexts(stringsToSend);

    if (translatedStrings.length !== stringsToSend.length) {
      return NextResponse.json(
        { error: "Translation length mismatch. AI format issue." },
        { status: 500 },
      );
    }

    // Apply translations back to the JSON structure
    textsToTranslate.forEach((item, idx) => {
      const translated = translatedStrings[idx];
      if (item.langKey === "meaning") {
        // Was string, convert to object
        item.ref.meaning = { en: item.extFallback, vi: translated };
      } else {
        // Was object
        item.ref[item.langKey] = translated;
      }
    });

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json({ message: "Vocabularies translated successfully", data });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown error", stack: err?.stack },
      { status: 500 },
    );
  }
}
