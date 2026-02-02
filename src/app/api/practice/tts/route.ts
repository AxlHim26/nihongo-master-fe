import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { TextToSpeechConvertRequestOutputFormat } from "@elevenlabs/elevenlabs-js/api";

export const runtime = "nodejs";

const modelId = process.env["ELEVENLABS_MODEL_ID"] ?? "eleven_multilingual_v2";
const outputFormat = (process.env["ELEVENLABS_OUTPUT_FORMAT"] ??
  "mp3_44100_128") as TextToSpeechConvertRequestOutputFormat;

const getClient = () => {
  const apiKey = process.env["ELEVENLABS_API_KEY"];
  if (!apiKey) {
    return null;
  }
  return new ElevenLabsClient({ apiKey });
};

export async function POST(request: Request) {
  const payload = (await request.json()) as { text?: string };
  const text = payload.text?.trim() ?? "";
  if (!text) {
    return new Response(JSON.stringify({ error: "Missing text input." }), { status: 400 });
  }

  const client = getClient();
  const voiceId = process.env["ELEVENLABS_VOICE_ID"];
  if (!client || !voiceId) {
    return new Response(
      JSON.stringify({ error: "Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID." }),
      { status: 500 },
    );
  }

  try {
    const audio = await client.textToSpeech.convert(voiceId, {
      text,
      modelId,
      outputFormat,
    });
    return new Response(audio as BodyInit, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message ? error.message : "ElevenLabs TTS failed.";
    console.error("ElevenLabs TTS error:", error);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
