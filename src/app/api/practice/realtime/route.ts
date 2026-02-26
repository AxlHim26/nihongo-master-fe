import type { AgentSettings } from "@/features/practice/types/agent";
import { buildSystemPrompt } from "@/features/practice/utils/jp-agent";
import { buildMegaLlmChatCompletionsUrl } from "@/lib/megallm";

export const runtime = "nodejs";

const completionsUrl = buildMegaLlmChatCompletionsUrl(process.env["MEGALLM_BASE_URL"]);

type MegaLlmSuccess = {
  ok: true;
  stream: ReadableStream<Uint8Array>;
};

type MegaLlmFailure = {
  ok: false;
  status: number;
  error: string;
};

type MegaLlmResult = MegaLlmSuccess | MegaLlmFailure;

const computeBaseMaxTokens = (message: string) => {
  const length = message.trim().length;
  if (length <= 8) {
    return 96;
  }
  if (length <= 20) {
    return 144;
  }
  if (length <= 80) {
    return 224;
  }
  return 288;
};

const computeMaxTokens = (message: string, model: string) => {
  const base = computeBaseMaxTokens(message);
  // gpt-oss models spend many tokens in reasoning before final answer.
  // Keep a larger output budget so assistant content can still be emitted.
  if (/gpt-oss/i.test(model)) {
    return Math.max(512, base);
  }
  return base;
};

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const readRetryAfterMs = (response: Response) => {
  const retryAfter = response.headers.get("retry-after");
  if (!retryAfter) {
    return null;
  }
  const retrySeconds = Number(retryAfter);
  if (Number.isFinite(retrySeconds) && retrySeconds > 0) {
    return retrySeconds * 1000;
  }
  return null;
};

const isRateLimitError = (status: number, message: string) =>
  status === 429 || /rate[_\s-]?limit|too many requests/i.test(message);

const getConfiguredModel = () =>
  (process.env["MEGALLM_MODEL"] ?? "mistralai/mistral-nemotron").trim();

const extractUpstreamError = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return `MegaLLM request failed with status ${response.status}.`;
  }

  try {
    const parsed = JSON.parse(text) as {
      error?: string | { message?: string };
      message?: string;
    };
    const errorMessage =
      typeof parsed.error === "string"
        ? parsed.error
        : parsed.error?.message || parsed.message || text;
    return String(errorMessage);
  } catch {
    return text;
  }
};

const createMegaLLMStream = async (
  message: string,
  settings: AgentSettings,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
): Promise<MegaLlmResult> => {
  const apiKey = process.env["MEGALLM_API_KEY"];
  const model = getConfiguredModel();
  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      error: "Thiếu MEGALLM_API_KEY trong .env.local.",
    };
  }

  const maxRateLimitRetries = parsePositiveInt(process.env["MEGALLM_RATE_LIMIT_RETRIES"], 2);
  const baseRetryDelayMs = parsePositiveInt(process.env["MEGALLM_RATE_LIMIT_DELAY_MS"], 1200);

  for (let attempt = 0; attempt <= maxRateLimitRetries; attempt += 1) {
    try {
      const response = await fetch(completionsUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          stream: true,
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: computeMaxTokens(message, model),
          messages: [
            { role: "system", content: buildSystemPrompt(settings) },
            ...history,
            { role: "user", content: message },
          ],
        }),
      });

      if (response.ok && response.body) {
        return {
          ok: true,
          stream: response.body,
        };
      }

      const upstreamError = await extractUpstreamError(response);
      const rateLimited = isRateLimitError(response.status, upstreamError);
      const failure: MegaLlmFailure = {
        ok: false,
        status: response.status,
        error: `MegaLLM (${model}): ${upstreamError}`,
      };

      if (rateLimited && attempt < maxRateLimitRetries) {
        const headerDelay = readRetryAfterMs(response);
        const retryDelay = headerDelay ?? baseRetryDelayMs * (attempt + 1);
        await sleep(retryDelay);
        continue;
      }

      return failure;
    } catch (error) {
      return {
        ok: false,
        status: 500,
        error: error instanceof Error ? error.message : "Không thể kết nối MegaLLM.",
      };
    }
  }

  return {
    ok: false,
    status: 429,
    error:
      "MegaLLM đang quá tải tạm thời. Hệ thống đã tự retry nhưng vẫn chạm giới hạn. Đợi vài giây rồi gửi lại.",
  };
};

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    message: string;
    settings: AgentSettings;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
  };
  const encoder = new TextEncoder();

  const megaResult = await createMegaLLMStream(
    payload.message,
    payload.settings,
    payload.history ?? [],
  );
  if (!megaResult.ok) {
    return new Response(
      JSON.stringify({
        error: megaResult.error,
      }),
      { status: megaResult.status || 500 },
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const reader = megaResult.stream.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) {
              continue;
            }
            const data = line.replace("data: ", "").trim();
            if (data === "[DONE]") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data) as {
                choices?: Array<{
                  delta?: {
                    content?:
                      | string
                      | Array<{
                          text?: string;
                          type?: string;
                        }>;
                    text?: string;
                  };
                }>;
              };
              const delta = json.choices?.[0]?.delta;
              const content = delta?.content;
              const text =
                typeof content === "string"
                  ? content
                  : Array.isArray(content)
                    ? content
                        .map((part) => (typeof part?.text === "string" ? part.text : ""))
                        .join("")
                    : typeof delta?.text === "string"
                      ? delta.text
                      : "";
              if (text) {
                controller.enqueue(encoder.encode(`data: ${text}\n\n`));
              }
            } catch {
              // ignore malformed chunk
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
