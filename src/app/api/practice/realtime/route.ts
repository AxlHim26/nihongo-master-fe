import type { AgentSettings } from "@/features/practice/types/agent";
import { buildSystemPrompt } from "@/features/practice/utils/jp-agent";
import { buildMegaLlmChatCompletionsUrl } from "@/lib/megallm";

export const runtime = "nodejs";

const modelId = process.env["MEGALLM_MODEL"] ?? "gpt-4o-mini";
const completionsUrl = buildMegaLlmChatCompletionsUrl(process.env["MEGALLM_BASE_URL"]);

const computeMaxTokens = (message: string) => {
  const length = message.trim().length;
  if (length <= 8) {
    return 40;
  }
  if (length <= 20) {
    return 80;
  }
  if (length <= 80) {
    return 140;
  }
  return 220;
};

const createMegaLLMStream = async (
  message: string,
  settings: AgentSettings,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
) => {
  const apiKey = process.env["MEGALLM_API_KEY"];
  if (!apiKey) {
    return null;
  }

  const response = await fetch(completionsUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId,
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

  if (!response.ok || !response.body) {
    return null;
  }

  return response.body;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    message: string;
    settings: AgentSettings;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
  };
  const encoder = new TextEncoder();

  const megaStream = await createMegaLLMStream(
    payload.message,
    payload.settings,
    payload.history ?? [],
  );
  if (!megaStream) {
    return new Response(
      JSON.stringify({
        error: "Missing MEGALLM_API_KEY or MegaLLM endpoint unavailable.",
      }),
      { status: 500 },
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const reader = megaStream.getReader();
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
