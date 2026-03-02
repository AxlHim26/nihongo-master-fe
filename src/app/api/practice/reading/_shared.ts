import { buildMegaLlmChatCompletionsUrl } from "@/lib/megallm";

const completionsUrl = buildMegaLlmChatCompletionsUrl(process.env["MEGALLM_BASE_URL"]);

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type CompletionOptions = {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
};

export class MegaLlmError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "MegaLlmError";
    this.status = status;
  }
}

const stripCodeFence = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
};

const extractStructuredBlock = (raw: string) => {
  const cleaned = stripCodeFence(raw);
  if (!cleaned) {
    return null;
  }

  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    // continue
  }

  const firstIndex = cleaned.search(/[\[{]/);
  if (firstIndex < 0) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = firstIndex; i < cleaned.length; i += 1) {
    const char = cleaned[i] ?? "";

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{" || char === "[") {
      depth += 1;
      continue;
    }

    if (char === "}" || char === "]") {
      depth -= 1;
      if (depth === 0) {
        const candidate = cleaned.slice(firstIndex, i + 1);
        try {
          JSON.parse(candidate);
          return candidate;
        } catch {
          return null;
        }
      }
    }
  }

  return null;
};

export const parseJsonBlock = <T>(rawContent: string): T | null => {
  const block = extractStructuredBlock(rawContent);
  if (!block) {
    return null;
  }

  try {
    return JSON.parse(block) as T;
  } catch {
    return null;
  }
};

const getConfiguredModel = () => {
  const configured = process.env["MEGALLM_MODEL"]?.trim();
  return configured && configured.length > 0 ? configured : "openai-gpt-oss-20b";
};

const extractErrorMessage = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return `MegaLLM request failed with status ${response.status}.`;
  }

  try {
    const parsed = JSON.parse(text) as {
      error?: string | { message?: string };
      detail?: { message?: string };
      message?: string;
    };

    if (typeof parsed.error === "string") {
      return parsed.error;
    }

    if (parsed.error?.message) {
      return parsed.error.message;
    }

    if (parsed.detail?.message) {
      return parsed.detail.message;
    }

    if (parsed.message) {
      return parsed.message;
    }
  } catch {
    return text;
  }

  return text;
};

export const requestMegaLlmContent = async ({
  messages,
  temperature = 0.55,
  maxTokens = 1200,
}: CompletionOptions) => {
  const apiKey = process.env["MEGALLM_API_KEY"];
  if (!apiKey) {
    throw new MegaLlmError("Missing MEGALLM_API_KEY", 500);
  }

  const response = await fetch(completionsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getConfiguredModel(),
      temperature,
      max_tokens: maxTokens,
      messages,
    }),
  });

  if (!response.ok) {
    const errorMessage = await extractErrorMessage(response);
    throw new MegaLlmError(errorMessage, response.status);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new MegaLlmError("MegaLLM returned empty content.", 502);
  }

  return content;
};
