import { NextResponse } from "next/server";
import { z } from "zod";

import { readingAnnotationResponseSchema } from "@/features/practice/types/reading";

import { MegaLlmError, parseJsonBlock, requestMegaLlmContent } from "../_shared";

export const runtime = "nodejs";

const payloadSchema = z.object({
  lines: z.array(z.string().min(1)).min(1).max(30),
});

const rawAnnotationSchema = z.object({
  items: z.array(
    z.object({
      line: z.string().min(1),
      romaji: z.string().min(1),
      translation: z.string().min(1),
    }),
  ),
});

const rawTextArraySchema = z.array(z.string().min(1));

const stripCodeFence = (text: string) =>
  text
    .trim()
    .replace(/^```(?:json|text)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

const parsePlainLines = (raw: string, expectedCount: number) => {
  const cleaned = stripCodeFence(raw);
  if (!cleaned) {
    return [];
  }

  const lines = cleaned
    .split(/\r?\n/)
    .map((line) =>
      line
        .trim()
        .replace(/^\s*(?:[-*•]\s*|\d+\s*[).:-]\s*|[A-D]\s*[).:-]\s*)/i, "")
        .trim(),
    )
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  return lines.slice(0, expectedCount);
};

const requestFallbackArray = async (prompt: string, maxTokens: number) => {
  const content = await requestMegaLlmContent({
    messages: [
      {
        role: "system",
        content: "Bạn chỉ trả về JSON array hợp lệ.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,
    maxTokens,
  });

  const parsedJson = parseJsonBlock<unknown>(content);
  const parsed = rawTextArraySchema.safeParse(parsedJson);
  if (!parsed.success) {
    const plainLines = parsePlainLines(content, 30);
    return plainLines.length > 0 ? plainLines : null;
  }
  return parsed.data.map((item) => item.trim());
};

const requestRomajiFallback = async (lines: string[]) => {
  const prompt = [
    "Chuyển từng dòng tiếng Nhật sau sang romaji Hepburn.",
    "Giữ nguyên thứ tự và số lượng dòng.",
    "Trả về đúng JSON array các chuỗi romaji.",
    "Không thêm markdown hay text ngoài JSON array.",
    ...lines.map((line, index) => `${index + 1}. ${line}`),
  ].join("\n");

  return requestFallbackArray(prompt, 900);
};

const requestTranslationFallback = async (lines: string[]) => {
  const prompt = [
    "Dịch từng dòng tiếng Nhật sau sang tiếng Việt tự nhiên.",
    "Giữ nguyên thứ tự và số lượng dòng.",
    "Trả về đúng JSON array các chuỗi tiếng Việt.",
    "Không thêm markdown hay text ngoài JSON array.",
    ...lines.map((line, index) => `${index + 1}. ${line}`),
  ].join("\n");

  return requestFallbackArray(prompt, 1000);
};

const buildPrompt = (lines: string[]) =>
  [
    "Bạn là trợ lý học tiếng Nhật cho người Việt.",
    "Nhiệm vụ: tạo romaji và bản dịch tiếng Việt cho từng dòng tiếng Nhật.",
    "Giữ nguyên thứ tự dòng. Dịch tự nhiên, ngắn gọn.",
    "Trả về đúng JSON object theo format:",
    '{"items":[{"line":"...","romaji":"...","translation":"..."}]}',
    "Không thêm markdown hay văn bản ngoài JSON.",
    "Danh sách dòng:",
    ...lines.map((line, index) => `${index + 1}. ${line}`),
  ].join("\n");

export async function POST(request: Request) {
  const rawPayload = (await request.json().catch(() => null)) as unknown;
  const parsedPayload = payloadSchema.safeParse(rawPayload);

  if (!parsedPayload.success) {
    return NextResponse.json({ message: "Payload không hợp lệ." }, { status: 400 });
  }

  try {
    const lines = parsedPayload.data.lines;
    const content = await requestMegaLlmContent({
      messages: [
        {
          role: "system",
          content: "Bạn chỉ trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: buildPrompt(lines),
        },
      ],
      temperature: 0.25,
      maxTokens: 1200,
    });

    const parsedJson = parseJsonBlock<unknown>(content);
    const parsed = rawAnnotationSchema.safeParse(parsedJson);
    let romajiFallback: string[] | null = null;
    let translationFallback: string[] | null = null;

    if (!parsed.success) {
      [romajiFallback, translationFallback] = await Promise.all([
        requestRomajiFallback(lines),
        requestTranslationFallback(lines),
      ]);
    }

    const items = lines.map((line, index) => {
      const candidate = parsed.success ? parsed.data.items[index] : null;
      const fallbackRomaji = romajiFallback?.[index];
      const fallbackTranslation = translationFallback?.[index];

      return {
        line,
        romaji: candidate?.romaji?.trim() || fallbackRomaji?.trim() || line,
        translation: candidate?.translation?.trim() || fallbackTranslation?.trim() || line,
      };
    });

    return NextResponse.json(readingAnnotationResponseSchema.parse({ items }));
  } catch (error) {
    if (error instanceof MegaLlmError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Không thể tạo romaji/dịch lúc này." }, { status: 500 });
  }
}
