import { NextResponse } from "next/server";
import { z } from "zod";

import { readingWordExplanationSchema } from "@/features/practice/types/reading";

import { MegaLlmError, parseJsonBlock, requestMegaLlmContent } from "../_shared";

export const runtime = "nodejs";

const payloadSchema = z.object({
  word: z.string().trim().min(1).max(30),
  context: z.string().trim().min(1).max(400),
});

const buildPrompt = (word: string, context: string) =>
  [
    "Bạn là giáo viên tiếng Nhật cho người Việt.",
    "Hãy giải thích ngắn gọn một từ/đoạn từ tiếng Nhật theo ngữ cảnh.",
    "Trả về đúng JSON object với format:",
    '{"word":"...","reading":"...","meaningVi":"...","exampleJa":"...","exampleVi":"..."}',
    "Yêu cầu:",
    "- reading: cách đọc kana (hiragana/katakana).",
    "- meaningVi: nghĩa tiếng Việt ngắn gọn, rõ ràng.",
    "- exampleJa: ví dụ tiếng Nhật đơn giản có dùng từ đó.",
    "- exampleVi: bản dịch tiếng Việt của exampleJa.",
    "Không thêm markdown hay văn bản ngoài JSON.",
    `Từ cần giải thích: ${word}`,
    `Ngữ cảnh: ${context}`,
  ].join("\n");

export async function POST(request: Request) {
  const rawPayload = (await request.json().catch(() => null)) as unknown;
  const parsedPayload = payloadSchema.safeParse(rawPayload);

  if (!parsedPayload.success) {
    return NextResponse.json({ message: "Payload không hợp lệ." }, { status: 400 });
  }

  try {
    const { word, context } = parsedPayload.data;

    const content = await requestMegaLlmContent({
      messages: [
        {
          role: "system",
          content: "Bạn chỉ trả về JSON object hợp lệ.",
        },
        {
          role: "user",
          content: buildPrompt(word, context),
        },
      ],
      temperature: 0.25,
      maxTokens: 360,
    });

    const parsedJson = parseJsonBlock<unknown>(content);
    const parsed = readingWordExplanationSchema.safeParse(parsedJson);

    if (!parsed.success) {
      return NextResponse.json({ message: "Không parse được giải thích từ." }, { status: 502 });
    }

    return NextResponse.json(parsed.data);
  } catch (error) {
    if (error instanceof MegaLlmError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Không thể giải thích từ lúc này." }, { status: 500 });
  }
}
