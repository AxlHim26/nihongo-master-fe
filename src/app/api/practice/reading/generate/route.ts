import { NextResponse } from "next/server";
import { z } from "zod";

import { readingLevelSchema } from "@/features/practice/types/reading";

import { MegaLlmError, parseJsonBlock, requestMegaLlmContent } from "../_shared";

export const runtime = "nodejs";

const payloadSchema = z.object({
  proficiencyLevel: readingLevelSchema,
});

const optionIds = ["A", "B", "C", "D"] as const;
const japanesePattern = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;

const levelGuideline: Record<z.infer<typeof readingLevelSchema>, string> = {
  N5: "Từ vựng cơ bản, câu rất ngắn, ngữ pháp đơn giản.",
  N4: "Hội thoại đời thường, câu ngắn-trung bình, ngữ pháp cơ bản mở rộng.",
  N3: "Tình huống thực tế, câu trung bình, có suy luận nhẹ.",
  N2: "Nội dung xã hội/học tập, từ vựng khá phong phú, câu dài vừa.",
  N1: "Nội dung tự nhiên, chiều sâu hơn, nhưng vẫn dễ đọc với văn bản ngắn.",
};

type LooseRecord = Record<string, unknown>;

type NormalizedQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanationVi: string;
  explanationJa: string;
};

type NormalizedExercise = {
  title: string;
  passage: string;
  questions: NormalizedQuestion[];
};

const isRecord = (value: unknown): value is LooseRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toText = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const getText = (record: LooseRecord, keys: string[]) => {
  for (const key of keys) {
    const value = toText(record[key]);
    if (value) {
      return value;
    }
  }
  return null;
};

const normalizePassage = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => toText(item))
      .filter((item): item is string => Boolean(item))
      .join("\n");
  }
  return toText(value) ?? "";
};

const normalizeOptions = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return item.trim();
        }
        if (isRecord(item)) {
          return (
            toText(item["text"]) ??
            toText(item["value"]) ??
            toText(item["label"]) ??
            toText(item["option"]) ??
            ""
          );
        }
        return "";
      })
      .filter((item) => item.length > 0)
      .slice(0, 4);
  }

  if (isRecord(value)) {
    const letterOptions = optionIds
      .map((id) => toText(value[id]))
      .filter((item): item is string => Boolean(item));
    if (letterOptions.length === 4) {
      return letterOptions;
    }

    return Object.values(value)
      .map((item) => toText(item))
      .filter((item): item is string => Boolean(item))
      .slice(0, 4);
  }

  return [];
};

const resolveAnswerIndex = (question: LooseRecord, options: string[]) => {
  const numberCandidates = [
    question["answerIndex"],
    question["correctIndex"],
    question["correct_option_index"],
  ];

  for (const candidate of numberCandidates) {
    if (typeof candidate === "number" && Number.isInteger(candidate)) {
      if (candidate >= 0 && candidate <= 3) {
        return candidate;
      }
      if (candidate >= 1 && candidate <= 4) {
        return candidate - 1;
      }
    }
  }

  const textCandidates = [
    question["answer"],
    question["correct"],
    question["correctOption"],
    question["correctOptionId"],
    question["correctAnswer"],
  ]
    .map((item) => toText(item))
    .filter((item): item is string => Boolean(item));

  for (const candidateRaw of textCandidates) {
    const candidate = candidateRaw.toUpperCase();

    const letterIndex = optionIds.indexOf(candidate as (typeof optionIds)[number]);
    if (letterIndex >= 0) {
      return letterIndex;
    }

    const parsedNumber = Number.parseInt(candidate, 10);
    if (Number.isInteger(parsedNumber)) {
      if (parsedNumber >= 0 && parsedNumber <= 3) {
        return parsedNumber;
      }
      if (parsedNumber >= 1 && parsedNumber <= 4) {
        return parsedNumber - 1;
      }
    }

    const optionMatchIndex = options.findIndex(
      (option) => option.includes(candidateRaw) || candidateRaw.includes(option),
    );
    if (optionMatchIndex >= 0) {
      return optionMatchIndex;
    }
  }

  return 0;
};

const normalizeQuestions = (value: unknown) => {
  const rawList: unknown[] = Array.isArray(value)
    ? value
    : isRecord(value)
      ? Object.values(value)
      : [];

  const normalized: NormalizedQuestion[] = [];

  for (const item of rawList) {
    if (!isRecord(item)) {
      continue;
    }

    const question = getText(item, ["question", "prompt", "text", "content", "query"]);
    if (!question) {
      continue;
    }

    const options = normalizeOptions(item["options"] ?? item["choices"] ?? item["answers"]);
    if (options.length !== 4) {
      continue;
    }

    const answerIndex = resolveAnswerIndex(item, options);

    const explanationVi =
      getText(item, ["explanationVi", "viExplanation", "giaiThich", "explanation"]) ??
      "Đáp án đúng bám sát thông tin xuất hiện trực tiếp trong bài đọc.";

    const explanationJa =
      getText(item, ["explanationJa", "jaExplanation", "reasonJa"]) ??
      "正解は本文の情報と一致しており、他の選択肢は本文と合っていません。";

    normalized.push({
      question,
      options,
      answerIndex,
      explanationVi,
      explanationJa,
    });
  }

  return normalized;
};

const toPassageLines = (passage: string) => {
  const splitByLine = passage
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (splitByLine.length >= 4) {
    return splitByLine;
  }

  return passage
    .split(/(?<=[。！？!?])/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const normalizeExercise = (raw: unknown): NormalizedExercise | null => {
  if (!isRecord(raw)) {
    return null;
  }

  const title = getText(raw, ["title", "heading", "topic", "name"]) ?? "Bài đọc";
  const passage = normalizePassage(
    raw["passage"] ?? raw["article"] ?? raw["text"] ?? raw["content"],
  );
  const questions = normalizeQuestions(raw["questions"] ?? raw["quiz"] ?? raw["items"]);

  if (!passage || questions.length < 5) {
    return null;
  }

  return {
    title,
    passage,
    questions: questions.slice(0, 5),
  };
};

const isJapaneseQuestionSet = (exercise: NormalizedExercise) =>
  exercise.questions.every(
    (question) =>
      japanesePattern.test(question.question) &&
      question.options.every((option) => japanesePattern.test(option)),
  );

const buildPrompt = (level: z.infer<typeof readingLevelSchema>) =>
  [
    "Bạn là người tạo đề luyện đọc tiếng Nhật cho học viên Việt Nam.",
    `Trình độ mục tiêu: ${level}. ${levelGuideline[level]}`,
    "Hãy tạo 1 bài đọc ngắn kèm câu hỏi trắc nghiệm.",
    "Yêu cầu bắt buộc:",
    "- Bài đọc bằng tiếng Nhật, 6-10 câu, mạch nội dung liền nhau.",
    "- Tạo đúng 5 câu hỏi trắc nghiệm bám sát bài đọc.",
    "- CÂU HỎI và 4 ĐÁP ÁN phải là TIẾNG NHẬT đúng trình độ.",
    "- answerIndex là số 0..3 trỏ tới đáp án đúng.",
    "- explanationVi: giải thích chi tiết bằng tiếng Việt.",
    "- explanationJa: giải thích tương ứng bằng tiếng Nhật, cùng nội dung với explanationVi.",
    "Trả về đúng JSON object theo cấu trúc:",
    '{"title":"...","passage":"line1\\nline2...","questions":[{"question":"...","options":["...","...","...","..."],"answerIndex":0,"explanationVi":"...","explanationJa":"..."}]}',
    "Không dùng markdown. Không thêm text ngoài JSON object.",
  ].join("\n");

const buildRepairPrompt = (rawContent: string, level: z.infer<typeof readingLevelSchema>) =>
  [
    `Hãy sửa output sau về JSON hợp lệ cho đề đọc tiếng Nhật trình độ ${level}.`,
    "Yêu cầu:",
    "- Giữ nội dung hợp lý, nhưng chuẩn hóa đúng format.",
    "- Phải có đúng 5 câu hỏi.",
    "- question và options là tiếng Nhật.",
    "- explanationVi tiếng Việt chi tiết, explanationJa tiếng Nhật tương ứng.",
    "- answerIndex là số 0..3.",
    "Trả về duy nhất JSON object, không markdown.",
    "RAW OUTPUT:",
    rawContent,
  ].join("\n");

const toResponsePayload = (
  exercise: NormalizedExercise,
  level: z.infer<typeof readingLevelSchema>,
) => ({
  id: `reading-${Date.now()}`,
  level,
  title: exercise.title.trim(),
  passageLines: toPassageLines(exercise.passage),
  questions: exercise.questions.map((question, index) => ({
    id: `q-${index + 1}`,
    question: question.question.trim(),
    options: question.options.map((option, optionIndex) => ({
      id: optionIds[optionIndex] ?? "A",
      text: option.trim(),
    })),
    correctOptionId: optionIds[question.answerIndex] ?? "A",
    explanationVi: question.explanationVi.trim(),
    explanationJa: question.explanationJa.trim(),
  })),
  createdAt: new Date().toISOString(),
});

export async function POST(request: Request) {
  const rawPayload = (await request.json().catch(() => null)) as unknown;
  const parsedPayload = payloadSchema.safeParse(rawPayload);

  if (!parsedPayload.success) {
    return NextResponse.json({ message: "Payload không hợp lệ." }, { status: 400 });
  }

  const level = parsedPayload.data.proficiencyLevel;

  try {
    const firstContent = await requestMegaLlmContent({
      messages: [
        {
          role: "system",
          content: "Bạn chỉ trả về JSON hợp lệ. Không thêm giải thích.",
        },
        {
          role: "user",
          content: buildPrompt(level),
        },
      ],
      temperature: 0.7,
      maxTokens: 1600,
    });

    const firstParsed = normalizeExercise(parseJsonBlock<unknown>(firstContent));
    if (
      firstParsed &&
      firstParsed.passage.trim().length > 0 &&
      isJapaneseQuestionSet(firstParsed)
    ) {
      return NextResponse.json(toResponsePayload(firstParsed, level));
    }

    const repairedContent = await requestMegaLlmContent({
      messages: [
        {
          role: "system",
          content: "Bạn là bộ chuẩn hóa output. Chỉ trả JSON hợp lệ.",
        },
        {
          role: "user",
          content: buildRepairPrompt(firstContent, level),
        },
      ],
      temperature: 0.2,
      maxTokens: 1700,
    });

    const repairedParsed = normalizeExercise(parseJsonBlock<unknown>(repairedContent));
    if (
      !repairedParsed ||
      repairedParsed.passage.trim().length === 0 ||
      !isJapaneseQuestionSet(repairedParsed)
    ) {
      return NextResponse.json(
        { message: "Không parse được đề đọc từ AI. Vui lòng bấm tạo lại." },
        { status: 502 },
      );
    }

    return NextResponse.json(toResponsePayload(repairedParsed, level));
  } catch (error) {
    if (error instanceof MegaLlmError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Không thể tạo bài đọc lúc này." }, { status: 500 });
  }
}
