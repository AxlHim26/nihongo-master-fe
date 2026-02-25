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

const computeMaxTokens = (message: string) => {
  const length = message.trim().length;
  if (length <= 8) {
    return 180;
  }
  if (length <= 20) {
    return 240;
  }
  if (length <= 80) {
    return 320;
  }
  return 420;
};

const getModelCandidates = () => {
  const configuredModel = (process.env["MEGALLM_MODEL"] ?? "alibaba-qwen3.5-397b").trim();
  const fallbackRaw =
    process.env["MEGALLM_FALLBACK_MODELS"] ??
    "mistralai/mistral-nemotron,openai-gpt-oss-20b,openai-gpt-oss-120b";
  const fallbackModels = fallbackRaw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return Array.from(new Set([configuredModel, ...fallbackModels]));
};

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
  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      error: "Thiếu MEGALLM_API_KEY trong .env.local.",
    };
  }

  const models = getModelCandidates();
  let lastFailure: MegaLlmFailure | null = null;

  for (const model of models) {
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
          max_tokens: computeMaxTokens(message),
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
      lastFailure = {
        ok: false,
        status: response.status,
        error: `MegaLLM (${model}): ${upstreamError}`,
      };

      const retryWithNextModel = [400, 402, 403, 404, 429].includes(response.status);
      if (!retryWithNextModel) {
        break;
      }
    } catch (error) {
      lastFailure = {
        ok: false,
        status: 500,
        error: error instanceof Error ? error.message : "Không thể kết nối MegaLLM.",
      };
      break;
    }
  }

  return (
    lastFailure ?? {
      ok: false,
      status: 500,
      error: "MegaLLM endpoint unavailable.",
    }
  );
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
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const text = json.choices?.[0]?.delta?.content ?? "";
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
